

#ifndef AMOMCU_BUFFER_H
#define AMOMCU_BUFFER_H

#ifdef __cplusplus
extern "C"
{
#endif


//写  WrLen 个字节数据到 缓冲区 RdBuf， 返回 true 表示成功， 返回false表示剩余缓冲区放不下这段数据了
extern bool qq_write(uint8 *WrBuf, unsigned short WrLen);

// 读  RdLen 个字节数据到 缓冲区 RdBuf， 返回读取到的有效数据长度
extern unsigned short qq_read(uint8 *RdBuf, unsigned short RdLen);

// 读出缓冲区中有效数据的大小，一般用于判断有没有数据可读
extern unsigned short qq_total();

// 清除缓冲区
extern void qq_clear();





#ifdef __cplusplus
}
#endif

#endif
