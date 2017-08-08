# 来伊份微商小程序

## 信息

- appid wx891acbb49e788bf9

## 开发

目录说明

> weapp

- static 内嵌资源文件，通常是布局资源
- page 页面相关
- component 组件相关
- service 服务：业务逻辑、数据存取
- common 对某些底层 API 的封装，而不是直接访问 API，方便做统一处理
- util 不包含业务逻辑，不同项目可以通用的工具方法。如表单验证，日期格式化等
- vendor 第三方库，因为不支持 node_modules，所以需要自己拷贝过来

调用链：`page -> component -> service -> common -> util -> vendor`

> static 

远程资源文件，通常是与布局无关的大图片
