### deisgned with aspnet mvc

## make sure that you have installed experss


### debuging in mac: 

``` mac/linux command

 "start": "DEBUG=tl_biz_tool_server supervisor -w 'views,services,models,controllers,config' -e 'html|node|js' node tl_server.js"

```






``` window batch

  -"start": "set DEBUG=express:* & supervisor tl_server.js"
  -"start": "set DEBUG=tl_biz_tool_server & supervisor --debug forever start tl_server.js"
  -"start": "set DEBUG=tl_biz_tool_server & supervisor tl_server.js"   --only show all logs belong to tl_biz_tool_server

```

``` shell command
>>npm install -g forever   -- while process uncaughtException, forever will clean resource, then try to restart this server.
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



GM 插件支持:需要在对应系统安装graphicsmagick

//http://www.graphicsmagick.org/INSTALL-windows.html#installing-using-installer-package
//using node gm libaray we need to first install graphicsmagick libaray
//test>>: gm convert logo: logo.gif
//https://github.com/aheckmann/gm

