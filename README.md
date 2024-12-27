# Fullstack Java Project

## Levi Kumbruck (3AONC)

## Folder structure

- Readme.md
- _architecture_: this folder contains documentation regarding the architecture of your system.
- `docker-compose.yml` : to start the backend (starts all microservices)
- _backend-java_: contains microservices written in java
- _demo-artifacts_: contains images, files, etc that are useful for demo purposes.
- _frontend-web_: contains the Angular webclient

Each folder contains its own specific `.gitignore` file.  
**:warning: complete these files asap, so you don't litter your repository with binary build artifacts!**

## How to setup and run this application

#### Backend

1. Run the `docker-compose.yml` file located in the root of the repository. This will:
   - Set up the necessary databases.
   - Start RabbitMQ.
   - Start frontendd

2. After running the `docker-compose.yml` file, start the backend microservices locally in the following order:
   - **Config Service**
   - **Discovery Service**
   - **Gateway Service**
   - Remaining services (in your preferred order).

#### Frontend

1. Use the `docker-compose.yml` file to set up and run the frontend.
   - The `docker-compose.yml` file utilizes the `Dockerfile` located in the `_frontend-web_` folder.
   
2. Once the setup is complete, the frontend will run on **port 4200**.
