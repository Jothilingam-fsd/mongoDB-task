# Zen Class Program API

## Overview

This project implements a RESTful API using Node.js, Express, and MongoDB (via Mongoose) to manage and query data for the Zen Class program. The database stores information about users, codekata problem-solving progress, attendance, topics taught, tasks assigned, company drives, and mentors.

### Features

- Query topics and tasks taught during a specific month (October).
- Retrieve company drives within a date range.
- Fetch company drives along with students who appeared for placements.
- Get the number of problems solved by a user in codekata.
- Find mentors with more than 15 mentees.
- Count users who were absent and did not submit tasks within a specific date range.

## Prerequisites

- Node.js v18 or higher (tested on v18+)
- MongoDB v4.4 or higher (local or remote instance)
- npm (comes with Node.js)

## Installation

1. Clone the repository or download source code:

   