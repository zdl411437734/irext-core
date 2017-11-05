#### For users out of China, please refer to the official website http://irext.net for documentations.

# IRext (revision 0.1.4)
#### 开源家用电器红外的编解码和免费码库方案

  IRext 提供数以万计的红外设备遥控编码, 并以独特的编、解码算法为任何嵌入式设备、移动设备以及服务器提供红外设备遥控功能


#### 官方站点: http://irext.net


#### IRext 具有的功能:
  - 从简易的XML文件开始对红外遥控码进行二进制压缩编码
  - 使用通用的解码算法，将编码成的二进制文件解码成 38KHz 红外波形码
  - 提供基于公有云和私有云的码库索引及维护控制台
  - 直接通过控制台上传、压缩、存储并管理编码及索引
  - 极限的编码格式，LIRC或者其它万能红外厂商需要使用数 KB 甚至上 MB 空间进行存储的单个电器码库，IRext 只需要使用几百字节的空间就可以存储 (已申请专利)
  - 极其节省资源的解码算法，整个万能红外码解码算法最多只消耗 1.5 KB 物理 RAM (已申请专利)
  - 支持 13 类家用电器 (空调、电视机、机顶盒、网络盒子、IPTV、音响、投影仪、风扇、扫地机器人、空气净化器、灯、DVD以及部分品牌机顶盒)
  - 支持数万种型号的家电
  - 支持不同平台 (51单片机、Linux、Windows、Java Web、Android、树莓派、Arduino等）
  - 提供不同平台解码程序样例
  - 支持在线解码以及在线板载解码

------

#### 红外码原理简介: http://irext.net/doc/

#### 码库品牌索引RestAPI: http://irext.net/doc/#services

#### 解码算法使用方法: http://irext.net/doc/#decode

------

#### IRext 的子项目:
  - 编码/解码算法: https://github.com/irext/irext-core
  - 红外码管理控制台私有云版本: https://github.com/irext/irext-console
  - 各种平台的解码示例: https://github.com/irext/irext-examples
  - Java Web索引API: https://github.com/irext/irext-web-api

------

#### 联系作者: 

<img src="https://github.com/irext/irext-public-console/blob/master/web/images/bobi_qr.png" align="left" height="160" width="160">
