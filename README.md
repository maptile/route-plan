# route-plan

# API

## Get specified customers by id

- Description: Get customer by id which passed as querystring in the url
- Endpoint: /v1/customer
- Method: Get
- Content Type: application/json
- Querystring
  - ids: an array contains one or more customer id
- ResponseData
```JSON
{
    "data": [{
        "_id": 1,
        "name": "上海化学工业区医疗中心",
        "address": "上海化学工业区和工路120号",
        "district": "金山区",
        "latLng": {
            "lat": "30.813131",
            "lng": "121.465561"
        }
    }],
    "status": 1
}
```

## Add cusomer

- Description: Add customers by searching their address and get latlng, then calc the newly added customer route to each existing customer
- Endpoint: /v1/customer
- Method: Post
- Content Type application/json
- RequestData
```JSON
{
    "customers": [{
        "_id": "10",
        "_rev": "1",
        "address": "上海市徐汇区宛平南路600号"
    }]
}
```
- ResponseData
```JSON
{
    "status":1,
    "data":"ok"
}
```
