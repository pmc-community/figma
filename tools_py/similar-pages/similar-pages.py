import os
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from multiprocessing import Pool, cpu_count
import json

# Suppress TensorFlow logging messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Enable XLA (Accelerated Linear Algebra) compilation
os.environ['TF_XLA_FLAGS'] = '--tf_xla_enable_xla_devices'

# Set optimal thread settings
num_threads = cpu_count()
tf.config.threading.set_inter_op_parallelism_threads(num_threads)
tf.config.threading.set_intra_op_parallelism_threads(num_threads)

def load_text_files(directory, max_files_per_batch=100): # files_batch
    # Load all text files from the specified directory in batches.
    files_content = {}
    file_list = [filename for filename in os.listdir(directory) if filename.endswith(".txt")]
    
    for i in range(0, len(file_list), max_files_per_batch):
        batch_files = file_list[i:i + max_files_per_batch]
        batch_content = {}
        for filename in batch_files:
            with open(os.path.join(directory, filename), 'r', encoding='utf-8') as file:
                batch_content[filename] = file.read()
        files_content.update(batch_content)
        yield files_content
        files_content.clear()  # Clear the dictionary to free memory

def calculate_similarity_matrix(embeddings):
    # Calculate the cosine similarity matrix for the given embeddings
    norm = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized_embeddings = embeddings / norm
    similarity_matrix = np.dot(normalized_embeddings, normalized_embeddings.T)
    return similarity_matrix

def chunks(lst, chunk_size):
    # Yield successive chunks of a given size from a list
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

def process_chunk(chunk_data):
    # Process a chunk of filenames and return similar files
    filenames, chunk_contents, model_url = chunk_data
    model = hub.load(model_url)
    embeddings = model(chunk_contents).numpy()
    similarity_matrix = calculate_similarity_matrix(embeddings)
    similar_files = {}

    similarity_threshold = 0.6  # Adjust similarity threshold as needed
    for i, filename in enumerate(filenames):
        similar_files[filename] = []
        for j, similarity in enumerate(similarity_matrix[i]):
            if i != j and similarity >= similarity_threshold:
                similar_files[filename].append((filenames[j], similarity))

        # Sort similar files by similarity in descending order
        similar_files[filename].sort(key=lambda x: x[1], reverse=True)

    return similar_files

def main(directory):
    # Initialize an empty dictionary to hold all similar files
    all_similar_files = {}

    for files_content in load_text_files(directory):
        filenames = list(files_content.keys())

        # Split filenames and contents into chunks
        batch_size = 100  # Adjust batch size based on your system's memory capacity (chunk_size_in_files_batch)
        chunks_data = [
            (chunk_filenames, [files_content[filename] for filename in chunk_filenames], "https://tfhub.dev/google/universal-sentence-encoder/4")
            for chunk_filenames in chunks(filenames, batch_size)
        ]

        # Use multiprocessing Pool to process chunks in parallel
        max_processes = cpu_count() # * threadMultiplicator 
        with Pool(processes=max_processes) as pool:
            similar_files_chunks = pool.map(process_chunk, chunks_data)

        # Combine results from chunks into the main dictionary
        for chunk_result in similar_files_chunks:
            all_similar_files.update(chunk_result)

    return all_similar_files

def transform_data(data):
    transformed_data = []
    for filename, similar_files in data.items():
        # Extract permalink based on filename (assuming structure)
        permalink = filename[:-4]
        permalink = permalink.replace('_', '/')
        # Convert similar files to a list of filenames (without similarity)
        similar_files_list = [f[0][:-4].replace('_', '/') for f in similar_files]
        result =  {
            "message": f"processed {permalink}", 
            "payload": {
                "permalink": permalink,
                "similarFiles": similar_files_list
            }
        }
        print(json.dumps(result), flush=True)
        transformed_data.append(result["payload"])
    return transformed_data

if __name__ == "__main__":
    directory = "doc-raw-contents"
    similar_files = main(directory)
    autoSimilarFiles = transform_data(similar_files)
    output_file_path = os.path.join(directory, "autoSimilar.json")
    with open(output_file_path, 'w') as f:
        json.dump(autoSimilarFiles, f, indent=4)
