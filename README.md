# 2024-3-ISC09-Sistema-de-Seguridad-con-Deteccion-de-Movimiento

## Overview
This repository contains several folders related to the Motion Detection Security System project. The main folders are:

- **01_Docs**: Project documentation.
- **SistemaDeSeguridad**: Main application built with React Native.
- **keystone-backend**: API and database configuration built with KeystoneJS.

## Repository Structure

### **01_Docs**
This folder contains all the project documentation, including architecture diagram, keystone entity-relationship and business plan.

---

### **SistemaDeSeguridad**
This folder contains the main application for the system. It is built using React Native and organized as follows:

- **app/**: Contains all the main screens of the project.
- **app_prueba/**: Includes prototypes or additional functionality tests.
- **assets/**: Images and visual resources used in the application.
- **componentes/**: Reusable React Native components.

#### Main Files:
- `App.js`: Main application configuration.
- `package.json`: Dependencies and application settings.

---

### **keystone-backend**
This folder contains the backend for the project. It is developed with KeystoneJS and uses a Prisma-configured database.

#### Main Files:
- **keystone.ts**: KeystoneJS configuration and setup.
- **schema.prisma**: Database schema definitions.
- **schema.graphql**: GraphQL schema definitions.

---

## Getting Started

### Prerequisites
- **Node.js**: To run frontend and backend scripts.
- **Yarn**: To manage project dependencies.

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ISC-UPA/2024-3-ISC09-Sistema-de-Seguridad-con-Deteccion-de-Movimiento.git
   cd 2024-3-ISC09-Sistema-de-Seguridad-con-Deteccion-de-Movimiento

2. Install the dependencies for the entire project:
   ```bash
   yarn install

### Running the applications

   1. Backend(keystone-backend)
      Navigate to the keystone-backend directopry
      ```bash
      cd keystone-backend
      npx keystone dev
      
   2. Frontend(SistemaDeSeguridad)
      Navigate to the SistemaDeSeguridad directory:
      
      ```bash
      cd SistemaDeSeguridad
      yarn start 
   
