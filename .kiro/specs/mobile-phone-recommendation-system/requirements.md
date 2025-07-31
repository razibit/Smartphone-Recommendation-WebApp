# Requirements Document

## Introduction

The Mobile Phone Recommendation System is a full-stack web application designed as a DBMS course project for 3rd-year Computer Science students. The system demonstrates proper database normalization (3NF and BCNF) while providing an intuitive interface for users to filter, compare, and explore mobile phone specifications. The application uses a modern tech stack with React/Next.js frontend, Node.js/Express backend, and MySQL database with normalized schema design.

## Requirements

### Requirement 1

**User Story:** As a user, I want to filter mobile phones using multiple criteria so that I can find devices that match my specific needs.

#### Acceptance Criteria

1. WHEN the user accesses the homepage THEN the system SHALL display a horizontal filter bar with dropdowns for Brand, Chipset, Display Type, Internal Storage, and Price Range
2. WHEN the user opens any dropdown THEN the system SHALL populate it with live data from the database via API calls
3. WHEN the user selects filter criteria and clicks "Apply Filter" THEN the system SHALL execute a dynamic SQL query and display matching results below the filter bar
4. WHEN filters are applied THEN the system SHALL display the exact SQL query used in a styled code box below the filters
5. IF no results match the filter criteria THEN the system SHALL display an appropriate "No results found" message

### Requirement 2

**User Story:** As a user, I want to view detailed information about mobile phones so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN the user clicks on a phone from the results THEN the system SHALL display full device specifications in a detailed view
2. WHEN displaying phone details THEN the system SHALL include device image, brand, model, processor, display specifications, storage, and pricing information
3. WHEN viewing phone details THEN the system SHALL maintain responsive design across different screen sizes

### Requirement 3

**User Story:** As a user, I want to compare multiple phones side-by-side so that I can evaluate different options.

#### Acceptance Criteria

1. WHEN the user selects multiple phones THEN the system SHALL provide a comparison interface
2. WHEN comparing phones THEN the system SHALL display specifications in a tabular format for easy comparison
3. WHEN in comparison mode THEN the system SHALL highlight key differences between selected devices

### Requirement 4

**User Story:** As a database administrator, I want the system to demonstrate proper normalization so that it serves as an educational example of BCNF and 3NF.

#### Acceptance Criteria

1. WHEN the database is designed THEN it SHALL implement separate normalized tables for device, brand, processor, display, storage, and pricing
2. WHEN tables are created THEN each table SHALL satisfy 3NF requirements with no transitive dependencies
3. WHEN tables are designed THEN they SHALL satisfy BCNF with each table having only one candidate key
4. WHEN queries are executed THEN they SHALL demonstrate proper joins across normalized tables
5. WHEN the system is documented THEN it SHALL include clear explanations of how each table satisfies normalization requirements

### Requirement 5

**User Story:** As a developer, I want the codebase to be modular and maintainable so that it demonstrates best practices for a course project.

#### Acceptance Criteria

1. WHEN the project is structured THEN it SHALL contain a maximum of 6-8 files total for compact design
2. WHEN the backend is implemented THEN it SHALL use separate modules for server, routes, controllers, and database connection
3. WHEN the frontend is implemented THEN it SHALL use component-based architecture with separate components for FilterBar, PhoneList, and SQLQueryBox
4. WHEN code is written THEN it SHALL follow clean code principles with proper commenting and readable structure

### Requirement 6

**User Story:** As a professor, I want the project to be easily understandable and deployable so that I can evaluate it efficiently.

#### Acceptance Criteria

1. WHEN the project is submitted THEN it SHALL include a comprehensive README.md with setup instructions
2. WHEN documentation is provided THEN it SHALL include a database schema diagram showing table relationships
3. WHEN the project is deployed THEN it SHALL run locally with simple setup commands
4. WHEN the project is shared THEN it SHALL be available on GitHub with proper version control
5. WHEN the UI is displayed THEN it SHALL use modern, clean design with Tailwind CSS for professional appearance

### Requirement 7

**User Story:** As a user, I want the interface to be responsive and visually appealing so that I have a pleasant browsing experience.

#### Acceptance Criteria

1. WHEN the application loads THEN it SHALL display a modern, responsive interface using Tailwind CSS
2. WHEN viewing on different devices THEN the layout SHALL adapt appropriately to screen size
3. WHEN interacting with filters THEN the UI SHALL provide immediate visual feedback
4. WHEN SQL queries are displayed THEN they SHALL be formatted in a code-styled box with proper syntax highlighting
5. WHEN phone images are displayed THEN they SHALL be properly sized and optimized for web display