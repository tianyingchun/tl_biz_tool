### deisgned with aspnet mvc

## make sure that you have installed experss


### debuging in mac: 

``` mac/linux command

 "start": "DEBUG=tl_biz_tool_server supervisor -w 'views,services,models,controllers,config' -e 'html|node|js' node tl_server.js"

```






``` window batch

  -"start": "set DEBUG=express:* & supervisor tl_server.js"
  
  -"start": "set DEBUG=tl_biz_tool_server & supervisor tl_server.js"   --only show all logs belong to tl_biz_tool_server

```

``` shell command

>>npm install -g express
>>npm install -g supervisor
>>npm start

```