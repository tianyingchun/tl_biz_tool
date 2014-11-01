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

>>npm install -g node-inspector 
>>npm install -g express
>>npm install -g supervisor
>>npm start

```


#### 开启调试服务:
>>npm install -g node-inspector
>>node-inspector  -- 启动调试WEB TOOL 代理

>>以DEBUG 模式开启本地的NODE 服务器 npm start

in package.json-->
"start": "set DEBUG=tl_biz_tool_server & supervisor --debug tl_server.js"

