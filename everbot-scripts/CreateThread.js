//Output Parameters: threadID : String

//ChatGPT api key
api_key = "YOUR_API_KEY";
//Header parameters
headers = Map();
headers.put("Authorization", "Bearer " + api_key);
headers.put("Content-Type", "application/json");
headers.put("OpenAI-Beta", "assistants=v2");
//This param is needed to use the V2 assistant apis
// The following webhook will create a thread and return the thread id
response = invokeurl
[
    url : "https://api.openai.com/v1/threads"
type: POST
headers: headers
];
response_json = response.toMap();
thread_id = response_json.get("id");
response.put("threadID", thread_id);
return response;