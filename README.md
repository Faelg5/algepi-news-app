
# ALGEPI News App

The **ALGEPI News App** is a research-based news aggregation platform that uses **NewsCatcher API** to provide curated news articles tailored to user-selected topics.  
This project is designed to enhance users' understanding of algorithmic personalization and its influence on information access.

## Project Description

**ALGEPI (ALGorithmic gatekeepers to promote EPIstemic welfare)** is a 4-year interdisciplinary research project (2023–2027) funded by the Research Foundation Flanders (FWO).  
We investigate how algorithmic gatekeepers impact media and epistemic welfare, focusing on their role in shaping news consumption.

### Key Objectives:

- **Identifying potential risks and solutions for accessing reliable, diverse information**
- **Exploring and testing how transparency features and user control affect people's understanding of personalized recommendation algorithms**
- **Offering recommendations for Public Service Media actors to implement new features that ensure users' access to diverse information**

### ALGEPI News App Features

We've developed a news feed prototype app with the following features:

- **Transparency tools** using Large Language Models (LLMs) to analyze article content.
- **Local ranking system** for news items, utilizing LLM summarization and text analysis (TF-IDF Score) for content relevance.

Through ALGEPI, we aim to better understand how algorithms influence our news consumption and promote informed decision-making in the digital age.

## App Goals

The ALGEPI News App is specifically designed to test algorithmic transparency and user-control mechanisms for enhancing users' knowledge of algorithmic personalization.  
It raises algorithmic awareness and gives users ways to control their news feed, enabling them to make educated choices about the content they consume.

## Features

- **Custom News Feed**: Fetches articles based on selected topics, providing users with a personalized news experience.
- **Historical Data**: Accesses news from January 1, 2019, for retrospective analysis.
- **User Experience Research**: Enables experiments on the influence of algorithmic content curation on epistemic welfare.

## Getting Started

### Prerequisites

- [NewsCatcher API](https://www.newscatcherapi.com) access credentials for making API calls.
- Node.js (>= 14.x) and a compatible package manager (e.g., npm or yarn).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/algepi-news-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd algepi-news-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure your API keys in the `.env` file:
   ```plaintext
   NEWS_CATCHER_API_KEY=your_api_key_here
   ```

## Usage

- **Fetching News**: The app allows up to 5,000 API calls with a rate limit of 1 call per second.
- **Historical Data Access**: Use the NewsCatcher API’s historical data feature for retrospective content.

To run the app:
```bash
npm start
```

## API Integration

The ALGEPI News App integrates with **NewsCatcher API v2** for:

- Fetching articles relevant to selected topics.
- Accessing historical data for educational and research purposes.

For detailed API documentation, refer to [NewsCatcher API Documentation](https://docs.newscatcherapi.com).

## Project Links

- [Human-IST Institute](https://human-ist.unifr.ch) - University of Fribourg's institute, contributing research expertise to this project.
- [ALGEPI Project](https://algepi.com) - The interdisciplinary research project of which this app is a part.

## Acknowledgments

We extend our gratitude to **Eduard Kaliushkin** and the team at [NewsCatcher API](https://www.newscatcherapi.com) for their support and providing us with a free access period for research and development.
