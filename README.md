dynamic-limo
============

Dynamic-Limo is a web service that lets you use Amazon Route 53 as a dynamic
DNS service.

## Running the service
Configure the app through the following environment variables:

+ `AWS_KEY`: The AWS Access Key ID
+ `AWS_SECRET`: The AWS Secret Access Key
+ `RECORDS`: A JSON object configuring the domain to be managed. Explained below.

Run the service locally with

```
  $ PORT=3000 node lib/index.js
```

### `RECORDS` variable
The `RECORDS` variable is a JSON object that maps keys of your choosing to
values that specify the Route 53 zone and the domain name. The structure is as
follows:

```
{
  "a1b2sdl340elrifgh" : {
    "zone" : "SLKNO24SD8FLKH",
    "name" : "mysubdomain.myslickdomain.com"
  }
}
```

Of course a more compact JSON representation is appropriate for the environment
variable's value.

The key should be randomly chosen, since the only real security here is
security through obscurity.

## API
`GET /ip`  
Returns The IP address of the client.

`GET /update/KEYNAME`  
For the domain specified by `KEYNAME` in the `RECORDS` object, sets the `A`
record with the client's IP address.

## About the name
`limo` maps to the number 53 using the [Mnemonic Major
System](http://en.wikipedia.org/wiki/Mnemonic_major_system).
