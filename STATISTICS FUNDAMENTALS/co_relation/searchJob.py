def search_job(role,location):
    return f"searching for {role} job in {location}"


tool_name = " Job Searhcer"

arguments = {
    "role": "AI Engineer",
    "location": " Rawalpindi"
}

result = search_job(

     arguments["role"],
    arguments["location"]
)
print(result)