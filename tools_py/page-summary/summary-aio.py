import re
import sys
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from transformers import TFAutoModelForSeq2SeqLM, AutoTokenizer
from multiprocessing import Pool, cpu_count

# Load the model and tokenizer globally
#print("loading model")
model_name = 't5-small'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = TFAutoModelForSeq2SeqLM.from_pretrained(model_name)
#print("model loaded")

# Function to preprocess the content
def preprocess_text(text):
    # Remove non-alphanumeric characters and extra whitespace
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

# Function to generate summary using Transformers
def summarize_text(text):
    if len(text.split()) <= 20:
        return text
    
    #print("start processing text")
    inputs = tokenizer.encode(text, return_tensors="tf", max_length=512, truncation=True)
    
    # Generate the interpretation with an appropriate token limit
    outputs = model.generate(inputs, max_length=50, min_length=10, length_penalty=2.0, num_beams=4, early_stopping=True)
    interpretation = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Ensure interpretation is within 20 words
    words = interpretation.split()
    if len(words) > 20:
        interpretation = interpretation[:interpretation.rfind(' ', 0, 20*4)] + ' ...'
    
    #print("end processing text")
    return interpretation

def process_file(file_name):
    file_path = os.path.join('doc-raw-contents', file_name)
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
    folder_path = 'doc-raw-contents'

    if not os.path.exists(folder_path):
        return 

    file_names = [f for f in os.listdir(folder_path) if f.endswith('.txt')]

    # Use ThreadPoolExecutor to process files concurrently
    with ThreadPoolExecutor(max_workers=cpu_count()) as executor:
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
