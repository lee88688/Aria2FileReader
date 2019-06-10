# Aria2FileReader

This project is used for streaming aria2 downloading files.
We provide a set of api to read the specific file from aria2 status. The api also support multiple files in one downloading like torrent downlads. 
We provide a simple http server base on koa which you can use to provie a simple stream file server. 

## Getting Started

simple http server
```javascript 
const as = new Aria2StreamServer(3000)
as.add('de87095fef32d5d1') // gid
as.update('de87095fef32d5d1', result) // gid and status of gid provided by tellStatus method of aria2 rpc
as.start() // start server
```

### Installing

```
```

## Contributing

Feel free to submit pull requests to us.

## Authors

* **lee88688** - *Initial work* - [lee88688](https://github.com/lee88688)

## License

This project is licensed under the MIT License.
