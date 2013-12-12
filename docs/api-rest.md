# Thoth - REST API

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

- **CURL Example**
  ```
  curl -v -u "${USER}:${PASSWORD}" "${THOTH_ENDPOINT}/api/records/${RECORD_ID}"
  ```

## Create a record

- **URL**
  
  /api/records
	
- **Method**

  `POST`

- **URL Parameters**

  `None`

- **Data Params**

  **Content-Type**: `application/json`
  
  Will create a new records with data fields.
  
	**Data Example**

  ```
  {
    category: ['Parent Category', 'Sub category'],
    label: "Record Label",
    text: "My record text",
    tags: ["tag #1", "tag #2"]
  }
  ```

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `{Record}`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`

  OR

  - **Code:** >=400 APPLICATION ERROR <br />
    **Content:** `{ error: "<Error>" }`

- **CURL Example**

  ```
  curl -v -X "POST" -u "${USER}:${PASSWORD}" -H 'Content-Type:application/json' -d '{"text": "Hello world !", "label": "Test", "category": ["Category A"]}' "${THOTH_ENDPOINT}/api/records"
  ```

## Update a record

- **URL**
  
  /api/records/:id

- **Method**

  `PUT`

- **URL Parameters**

  **Required:**

  `id=[alphanumeric]`

- **Data Params**

  **Content-Type**: `application/json`
  
  Will only update the existing fields in data
  
  **Data Example**
```
{
	category: ['Parent Category', 'Sub category', 'Sub Sub category'],
	label: "Record Label",
	text: "My record text",
    tags: ['tag #1', 'tag #2']
}
```

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `{Record}`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`

  OR

  - **Code:** >=400 APPLICATION ERROR <br />
    **Content:** `{ error: "<Error>" }`

- **CURL Example**
```
curl -v -X "PUT" -u "${USER}:${PASSWORD}" -H 'Content-Type:application/json' -d '{"text": "Hello world !", "label": "Test", "category": ["Category A"]}' "${THOTH_ENDPOINT}/api/records/${RECORD_ID}"
```

## Delete a record

- **URL**
  
  /api/records/:id

- **Method**

  `DELETE`

- **URL Parameters**

  **Required:**

  `id=[alphanumeric]`

- **Data Params**

  `None`

- **Success Response**

  - **Code:** 204 <br />
    **Content:** `None`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`

  OR

  - **Code:** >=400 APPLICATION ERROR <br />
    **Content:** `{ error: "<Error>" }`

- **CURL Example**
```
curl -v -X "DELETE" -u "${USER}:${PASSWORD}" "${THOTH_ENDPOINT}/api/records/${RECORD_ID}"
```

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

- **CURL Example**
```
curl -v -u "${USER}:${PASSWORD}" "${THOTH_ENDPOINT}/api/categories"
```

## Show user informations

Show informations about the current user

- **URL**

  /api/users/me

- **Method**

  `GET`

- **URL Parameters**

  `None`

- **Data Params**

  `None`

- **Success Response**

  - **Code:** 200 <br />
    **Content:** `{User}`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "InvalidCredentialsError" }`

- **CURL Example**
```
curl -v -u "${USER}:${PASSWORD}" "${THOTH_ENDPOINT}/api/users/me"
```