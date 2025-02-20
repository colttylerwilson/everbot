//Input Paramters userInput : String, threadID : String
//We get threadID when we create the thread with the other script and then pass it here.
//We get userInput from the user's input from Zobot
//Output Parameters assistantReplty : String
//This is sent back to the client in chat by using it as a dynamic reference in a text card %assistant_reply%


// ChatGPT API key
api_key = "YOUR API KEY";
chatGPT_assistant_id = "YOUR ASSISTANT ID";
// Header parameters
headers = Map();
headers.put("Authorization", "Bearer " + api_key);
headers.put("Content-Type", "application/json");
headers.put("OpenAI-Beta", "assistants=v2");
// Get the thread ID and user input from the session
thread_id = session.get("threadID").get("value");
user_input = session.get("userInput").get("value");
info "Thread ID: " + thread_id;
info "User Input: " + user_input;
// Messages API call - Send user input to OpenAI thread
requestBody = Map();
requestBody.put("role", "user");
requestBody.put("content", user_input);
jsonRequestBody = requestBody.toString();
response = invokeurl
[
    url : "https://api.openai.com/v1/threads/" + thread_id + "/messages"
type: POST
parameters: jsonRequestBody
headers: headers
];
info "Message API Response: " + response;
// Runs API call - Executes the assistant to generate a response
requestBody = Map();
requestBody.put("assistant_id", chatGPT_assistant_id);
jsonRequestBody = requestBody.toString();
response = invokeurl
[
    url : "https://api.openai.com/v1/threads/" + thread_id + "/runs"
type: POST
parameters: jsonRequestBody
headers: headers
];
response_json = response.toMap();
run_id = response_json.get("id");
run_status = "queued";
// Retry loop to wait for completion of the assistant's response
retry_count = { 1, 2, 3, 4, 5};
for each  retry in retry_count
{
        if(run_status != "completed") {
    // Wait 3 seconds before checking the status
    getUrl("https://httpstat.us/200?sleep=3000");
    response = invokeurl
    [
        url : "https://api.openai.com/v1/threads/" + thread_id + "/runs/" + run_id
    type: GET
    headers: headers
		];
    response_json = response.toMap();
    run_status = response_json.get("status");
}
}
// Fetch the assistant's response from the thread
getmsg_url = "https://api.openai.com/v1/threads/" + thread_id + "/messages";
response = invokeurl
[
    url : getmsg_url
type: GET
headers: headers
];
info "Fetch Messages Response: " + response;
response_json = response.toMap();
// Get the latest assistant response
assistant_response = response_json.get("data").get(0).get("content").get(0).get("text").get("value");
info "Assistant Response: " + assistant_response;
// Ensure we have a valid response
if (assistant_response == "" || assistant_response == null) {
    assistant_response = "Sorry, I couldn't generate a response.";
}
// 🔵 **New Chat Completions API Call** - Generate a possible user question based on the assistant's response
messages = List();
// System Instructions for question generation
system_message = Map();
system_message.put("role", "system");
system_message.put("content", "Based on the provided assistant response, generate a question a user might have originally asked to warrant that response. The question should be relevant, clear, and specific.");
messages.add(system_message);
// Assistant's Response Message
assistant_message = Map();
assistant_message.put("role", "assistant");
assistant_message.put("content", assistant_response);
messages.add(assistant_message);
// Create Chat Completions API Request
chat_completions_request = Map();
chat_completions_request.put("model", "gpt-3.5-turbo");
chat_completions_request.put("messages", messages);
chat_completions_request.put("store", true);
// Add metadata to track purpose
metadata = Map();
metadata.put("source", "Zobot");
metadata.put("purpose", "question_generation");
chat_completions_request.put("metadata", metadata);
info "Chat Completions Request Body: " + chat_completions_request.toString();
// Invoke Chat Completions API
chat_completions_response = invokeurl
[
    url : "https://api.openai.com/v1/chat/completions"
type: POST
parameters: chat_completions_request.toString()
headers: headers
];
info "Chat Completions Response: " + chat_completions_response;
// Prepare final response to return to the user
final_response = Map();
final_response.put("assistantReply", assistant_response);
return final_response;