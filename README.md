
# MeatMe Backend API

This projects have purpose to creating an API that will be consumed by the frontend such as android mobile apps.


## Environment Variables

To run this project, you will need to create .env file for storing credentials. Please use an example like [this](https://github.com/guditubagus/CC-MeatMe/blob/master/src-backend-marketplace/.env.example)

Filled in all of those ```key=value```, just set the value

`PORT`

`DB_HOST`

`DB_USER`

`DB_PASSWORD`

`DB_NAME`

`JWT_SECRET`

`PROJECT_ID`

`KEYFILE`

`BUCKET_NAME`

After that, save it on **(src-backend-marketplace)** folder project.

## IMPORTANT!
1. Before replicate this projects, please make sure to provision some infrastructure in Google Cloud. Like CloudSQL (MySQL) and Google Cloud Storage.

2. Make a service account

    `IAM - Service Accounts - Create Service Account - Grant this service account - Role (Cloud Storage - Storage Object Creator) - Done`

    `Click three dots on right - Manage Keys - Add Key - Create New Key - JSON - Create`

Save this json file to projects folder. **(src-backend-marketplace)**


### Installation
1. Clone this project
```
  git clone https://github.com/guditubagus/CC-MeatMe.git
```

2. For Backend Marketplace
```
  cd CC-MeatMe/src-backend-marketplace
  docker build -t backend-api:v1 .
```

3. For ML API
```
  cd ../src-ml-api
  docker build -t ml-api:v1 .
```


## Deployment
To deploy this project locally, run

```
  docker run -p 3000:3000 -itd backend-api:v1
  docker run -p 5000:5000 -itd ml-api:v1
```
And now, you can use pacman or other REST tools to test those API's


## Tech Stack
**Server:** Google Cloud Platform, Node.js, Express, Flask


## Pictures
### a. Cloud Architecture

![cloud-architecture](./images/cloud-architecture.png "cloud-architecture")

### b. Database Design

![db-design](./images/db-design.png "db-design")

