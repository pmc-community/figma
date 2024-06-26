import re
import sys
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from transformers import TFAutoModelForSeq2SeqLM, AutoTokenizer
from multiprocessing import cpu_count

# Get settings (considering that this script runs from project root directory)
build_settings_path = '_data/buildConfig.yml'
tools_py_path = os.path.abspath(os.path.join('tools_py'))
if tools_py_path not in sys.path:
    sys.path.append(tools_py_path)
from modules.globals import get_key_value_from_yml, clean_up_text

# general settings
rawContentFolder = get_key_value_from_yml(build_settings_path, 'rawContentFolder')
summaryLength = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['summaryLength']
threadMultiplicator = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['threadMultiplicator']

# tokenizer settings
return_tensors = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['tokenizer']['return_tensors']
prompt = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['tokenizer']['prompt']
max_length = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['tokenizer']['max_length']
truncation = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['tokenizer']['truncation']
skip_special_tokens = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['tokenizer']['skip_special_tokens']

# model settings
model = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['name']
model_max_length = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['max_length']
model_min_length = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['min_length']
model_length_penalty = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['length_penalty']
model_num_beams = get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['num_beams']
model_early_stopping =  get_key_value_from_yml(build_settings_path, 'pyPageSummary')['model']['early_stopping']


# Load the model and tokenizer globally
#print("loading model")
model_name = model
model = TFAutoModelForSeq2SeqLM.from_pretrained(model_name)
#print("model loaded")

# Function to preprocess the content
def preprocess_text(text):
    # Remove non-alphanumeric characters and extra whitespace
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

# Function to generate summary using Transformers
def summarize_text(text):
    if len(text.split()) <= summaryLength:
        return clean_up_text(text)
    
    tokenizer = AutoTokenizer.from_pretrained(model_name) # tokenizer to be loaded here to avoid inter-processes issues
    #print("start processing text")
    inputs = tokenizer.encode(
        f'{prompt}: ' + text, 
        return_tensors = return_tensors, 
        max_length = max_length, 
        truncation = truncation
    )
    
    # Generate the interpretation with an appropriate token limit
    outputs = model.generate(
        inputs, 
        max_length = model_max_length, 
        min_length = model_min_length, 
        length_penalty = model_length_penalty, 
        num_beams = model_num_beams, 
        early_stopping = model_early_stopping
    )
    interpretation = tokenizer.decode(
        outputs[0], 
        skip_special_tokens = skip_special_tokens
    )

    # Ensure interpretation is within 20 words
    words = interpretation.split()
    if len(words) > summaryLength:
        interpretation = interpretation[:interpretation.rfind(' ', 0, summaryLength*4)]

    interpretation = clean_up_text(interpretation, [f'{prompt}:']) + ' ...'
    
    #print("end processing text")
    return interpretation

def process_file(file_name):
    file_path = os.path.join(rawContentFolder, file_name)
    with open(file_path, 'r') as file:
        text = file.read()
    interpretation = summarize_text(text)
    modified_file_name = os.path.splitext(file_name)[0].replace('_', '/')
    return {
        "message": f"processed {modified_file_name}", 
        "payload": {
            "permalink": modified_file_name, 
            "summary": interpretation
        }
    }

def process_files(pageList=None):
    folder_path = rawContentFolder

    if not os.path.exists(folder_path):
        return 

    file_names = [f for f in os.listdir(folder_path) if f.endswith('.txt')]

    # Use ThreadPoolExecutor to process files concurrently
    max_workers = cpu_count() * threadMultiplicator
    with ThreadPoolExecutor(max_workers = max_workers) as executor:
        future_to_file = {executor.submit(process_file, file_name): file_name for file_name in file_names}
        for future in as_completed(future_to_file):
            result = future.result()
            print(json.dumps(result), flush=True)

if __name__ == "__main__":
    try:
        json_data = json.loads(sys.argv[1])
    except (IndexError, json.JSONDecodeError):
        json_data = None  # Use an empty dictionary as default
    pageList = json_data['pageList'] if json_data is not None else None
    process_files(pageList)
