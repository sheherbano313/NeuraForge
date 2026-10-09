# def search_job(role, location):
#     return f"Searching for {role} jobs in {location}"


# def get_weather(city):
#     return f"The weather in {city} is sunny"


# user_request = "What's the weather in Rawalpindi?"

# tool_name = "get_weather"

# arguments = {
#     "city": "Rawalpindi"
# }

# if tool_name == "get_weather":
#     result = get_weather(arguments["city"])

# elif tool_name == "search_job":
#     result = search_job(
#         arguments["role"],
#         arguments["location"]
#     )

# print(result)

def search_job(role, location):
    return f"Searching for {role} jobs in {location}"


def get_weather(city):
    return f"The weather in {city} is sunny"


user_request = "What's the weather in Rawalpindi?"

tool_name = "get_weather"

arguments = {
    "city": "Rawalpindi"
}


if tool_name == "get_weather":
    result = get_weather(arguments["city"])

elif tool_name == "search_job":
    result = search_job(
        arguments["role"],
        arguments["location"]
    )

print(result)