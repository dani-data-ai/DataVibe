# Lovable AI for Databases — MVP Specification

## 1. Project Overview

**Summary:**  
Lovable AI for Databases is a web application that enables users to manage and query relational databases using natural language prompts, powered by large language models (LLMs). The application focuses on making database exploration, querying, and simple schema modifications accessible, safe, and transparent.

**Target Users:**  
- Data analysts
- Developers
- Business users with basic data literacy
- Database administrators (for review/approval workflows)

**Key Goals:**
- Allow users to connect to existing databases (e.g., Northwind, public data warehouse) and interact using plain language.
- Enable safe data exploration and querying in production (read-only).
- Allow simple schema changes (e.g., add column, create view) in a controlled development environment.
- Integrate LLMs to interpret prompts, generate and explain SQL, and ensure user confirmation before executing operations.
- Maintain clear separation between development and production environments, with PR-style approval workflow for schema changes.
- Provide a modern web interface that abstracts away direct SQL interaction, focusing on usability and security.
