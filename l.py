import pandas as pd
import random
import faker

fake = faker.Faker()

# Sample values for categorical fields
companies = ["TechSoft", "BuildCorp", "FinServe", "HealthPlus", "GreenEnergy", "EduWorks", "AutoDrive"]
industries = ["Software", "Construction", "Finance", "Healthcare", "Energy", "Education", "Automotive"]
roles = ["Engineer", "Manager", "Director", "Analyst", "VP", "Consultant", "Intern"]
locations = ["New York", "San Francisco", "Chicago", "Boston", "Seattle", "Austin", "Denver"]

data = []

for _ in range(200):
    name = fake.name()
    email = fake.email()
    company = random.choice(companies)
    industry = random.choice(industries)
    role = random.choice(roles)
    location = random.choice(locations)
    company_size = random.randint(50, 1000)
    past_interaction_score = round(random.uniform(0, 1), 2)
    # Simple heuristic for LeadScore (you can improve this)
    lead_score = 1 if (past_interaction_score > 0.5 and company_size > 100 and role in ["Manager", "Director", "VP"]) else 0

    data.append([
        name,
        email,
        company,
        industry,
        role,
        location,
        company_size,
        past_interaction_score,
        lead_score
    ])

df = pd.DataFrame(data, columns=[
    "Name", "Email", "Company", "Industry", "Role", "Location", "CompanySize", "PastInteractionScore", "LeadScore"
])

df.to_csv("leads.csv", index=False)
print("leads.csv with 200 rows generated in backend/")
