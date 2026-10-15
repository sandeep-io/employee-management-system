# Employee Management System

A web-based Employee Management System built using Spring Boot, MySQL, HTML, CSS, and JavaScript. It allows users to manage employee records through a simple and user-friendly interface.

## Features

- **Add Employee:** Add new employees with their personal and professional details.
- **View Employees:** Display employee records from the database.
- **Update Employee:** Edit existing employee information.
- **Delete Employee:** Remove employee records.
- **Search Employees:** Search employee records using the available search field.
- **Input Validation:** Validate employee details, including email and salary.
- **REST API:** Connect the frontend to the Spring Boot backend.

## Technologies Used

**Backend**
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

**Frontend**
- HTML
- CSS
- JavaScript

**Database**
- MySQL

**Tools**
- IntelliJ IDEA
- MySQL Workbench
- Git and GitHub
- Postman

## Project Structure

```text
employee-management-system/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/employee_management_system/
│       │       ├── controller/
│       │       ├── entity/
│       │       ├── repository/
│       │       ├── service/
│       │       └── EmployeeManagementSystemApplication.java
│       └── resources/
│           ├── static/
│           │   ├── index.html
│           │   ├── style.css
│           │   └── app.js
│           └── application.properties
├── pom.xml
└── README.md
```

## Database Configuration

1. Install MySQL and create the database:

```sql
CREATE DATABASE employee_db;
```

2. Configure your MySQL connection in `application.properties`.
3. Set your database username and password using your local configuration. Do not commit database passwords or other secrets to GitHub.

## How to Run the Project

### Prerequisites

- Java 17 or compatible JDK
- MySQL Server
- Git

### Steps

1. Clone the repository:

```bash
git clone -b development https://github.com/YOUR_USERNAME/employee-management-system.git
```

2. Open the project folder:

```bash
cd employee-management-system
```

3. Configure your MySQL database connection.

4. Start the Spring Boot application:

**Windows (PowerShell or Git Bash):**

```bash
./mvnw spring-boot:run
```

5. Open the application in your browser:

http://localhost:8080/

## REST API Endpoints

Base URL: `http://localhost:8080/api/employees`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/{id}` | Get an employee by ID |
| POST | `/api/employees` | Add a new employee |
| PUT | `/api/employees/{id}` | Update an employee |
| DELETE | `/api/employees/{id}` | Delete an employee |

## Learning Outcomes

- Developed REST APIs using Spring Boot.
- Integrated a Java application with MySQL.
- Implemented CRUD operations.
- Connected a frontend to backend APIs.
- Practiced input validation and database management.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
