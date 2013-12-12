# REST API

## Show records

Show a list of records available for the current user

- **URL**
  
  /api/records

- **Method**

  `GET`

- **URL Parameters**

  **Optional:**

  `skip=[numeric]` <br />
  `limit=[numeric]` <br />
  `search=[alphanumeric]`

- **Data Params**

  `None`

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `[{Record}, ...]`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`

## Show one record

Show a record

- **URL**
  
  /api/records/:id

- **Method**

  `GET`

- **URL Parameters**

  **Required:**

  `id=[alphanumeric]`

- **Data Params**

  `None`

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `[{Record}, ...]`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`


## Show categories

Show available categories for the current user

- **URL**

  /api/records/categories

- **Method**

  `GET`

- **URL Parameters**

  `None`

- **Data Params**

  `None`

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `[[Category], ...]`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`