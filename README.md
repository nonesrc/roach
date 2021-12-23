<div align="center">
  <a href="https://github.com/nonesrc/roach">
    <img src="https://s3.bmp.ovh/imgs/2021/12/5918bdb488d11707.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Roach</h3>

  <p align="center">
    一个属于CUIT的感觉很齐的API接口集合
    <br />
    <a href="#"><small>报告问题</small></a>
    ·
    <a href="#"><small>请求新接口</small></a>
  </p>
  <a href="https://github.com/nonesrc/roach/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/nonesrc/roach?style=for-the-badge"></a>
  <a href="https://github.com/nonesrc/roach/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/nonesrc/roach?style=for-the-badge"></a>
  <a href="https://github.com/nonesrc/roach/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/nonesrc/roach?style=for-the-badge"></a>
</div>

### 什么是Roach

Roach让获取CUIT信息更为简单，只需提供入学生账号（目前）就可以获取如**计算中心**，**教务处**等登录信息。

### 特点

- [X] 使用Node+TypeScript编写。
- [X] 提供插件系统，方便自行扩展。
- [X] 源码简单，新手可读。

### 运行

开发（注意安装开发依赖）
``` javascript
npm i
npm run dev
```

生产
不介意可直接上TS，或者使用`npm run build`构建JS版本。

### 提供功能（目前）

所有功能基实现于外网认证方式，即通过webVPN账号登陆。

- [X] 计算中心认证 - ccAuth
- [X] webVPN 认证 - easyAuth
- [X] sso单点登录认证 - ssoAuth
- [X] 教务处认证 - eduAuth

### 开发依赖

1. nodemon
2. ts-node
3. commitizen

### 架构
<img src="https://s3.bmp.ovh/imgs/2021/12/cc969ef1dff8fe2a.png" alt="drawing" style="width:80%;"/>

### 许可
MIT.
