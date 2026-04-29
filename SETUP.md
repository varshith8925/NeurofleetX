# NeuroFleetX Setup

## Services

### MySQL
1. Create a MySQL user or update credentials in [`application.properties`](/C:/Users/LSW/Desktop/Infosys_internship/neurofleet-backend/src/main/resources/application.properties).
2. Run [`schema.sql`](/C:/Users/LSW/Desktop/Infosys_internship/database/schema.sql) if you want an explicit schema ahead of boot.

### Spring Boot
1. Open [`neurofleet-backend`](/C:/Users/LSW/Desktop/Infosys_internship/neurofleet-backend).
2. Run `mvn spring-boot:run` or `.\mvnw.cmd spring-boot:run` once the Maven wrapper is fixed or Maven is installed.

### Flask AI service
1. Open [`ai-service`](/C:/Users/LSW/Desktop/Infosys_internship/ai-service).
2. Install dependencies with `pip install -r requirements.txt`.
3. Run `python app.py`.

### Vite frontend
1. Open [`neurofleet`](/C:/Users/LSW/Desktop/Infosys_internship/neurofleet).
2. Run `npm install`.
3. Run `npm run dev`.

## Notes

- No seed data is included. Create users through the signup flow and then operate the system from the dashboards.
- The frontend only talks to Spring Boot on `http://localhost:8081/api`.
- Route optimization flows through Spring Boot, which persists route records in MySQL after the Flask call returns.
