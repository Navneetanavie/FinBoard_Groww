# Finboard - Dynamic Finance Dashboard

A customizable finance dashboard that allows users to connect to API endpoints and visualize data using various widgets (Cards, Tables, Charts).

## Key Implementation Logics

### 1. Array and Homogeneous Field Logic (Chart & Table)
For **Chart** and **Table** widgets, the application requires data to be in a structured list format. The system automatically detects fields that can serve as data sources using two strategies:

*   **Homogeneous Object**: An object where all values are objects with identical keys.
    *   *Example*:
        ```json
        {
          "2023-10-01": { "open": 100, "close": 105 },
          "2023-10-02": { "open": 102, "close": 108 }
        }
        ```
    *   Here, both "2023-10-01" and "2023-10-02" have the same structure (`open`, `close`). The system flattens this into a list for visualization.

*   **Array of Objects**: A standard JSON array where each item is an object.
    *   *Example*:
        ```json
        [
          { "date": "2023-10-01", "price": 100 },
          { "date": "2023-10-02", "price": 102 }
        ]
        ```

### 2. Form Validation and Field Resetting
The widget configuration form (`WidgetForm`) manages state to ensure data consistency.

**Validation Rules:**
*   **Widget Name**: Required.
*   **API URL**: Required.
*   **Refresh Interval**: Must be greater than 0.
*   **Fields**: At least one data field must be selected.
*   **Data Key (Table/Chart)**: Required to identify the root data source (e.g., the array or homogeneous object).

**Reset Logic:**
To prevent invalid configurations, the form automatically resets dependent fields when a parent field changes:
*   **API URL Change**: Resets `Data Key` and `Selected Fields` (since the data structure has likely changed).
*   **Data Key Change**: Resets `Selected Fields` (since the available fields within that key are different).
*   **Display Mode Change**: Resets `Selected Fields` (since Table/Chart have different requirements than Cards).

### 3. Field Filtering (String vs. Numeric)
The application intelligently filters available fields based on the selected **Display Mode**:

*   **Chart Mode**:
    *   **Y-Axis (Data Fields)**: Only **numeric** fields are shown. Charts require numerical values to plot lines/bars.
    *   **X-Axis (Data Key)**: Typically requires a unique identifier, often a string (date, time, ID).
*   **Table/Card Mode**:
    *   Allows broader field selection, including strings and booleans, as they can be displayed directly as text.

### Testing
You can test the dashboard using your own API keys or the demo keys provided below.

**Note**: This dashboard is optimized for JSON APIs with relatively standard structures (flat objects, arrays, or homogeneous maps). Highly complex nested structures or GraphQL endpoints may require specific path configuration.

**Sample APIs for Testing:**

1.  **Alpha Vantage (Intraday Stock App)**:
    ```
    https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&outputsize=full&apikey=demo
    ```
2.  **Coinbase (Crypto Exchange Rates)**:
    ```
    https://api.coinbase.com/v2/exchange-rates?currency=BTC
    ```
3.  **Alpha Vantage (Realtime Bulk Quotes)**:
    ```
    https://www.alphavantage.co/query?function=REALTIME_BULK_QUOTES&symbol=MSFT,AAPL,IBM&apikey=demo
    ```
