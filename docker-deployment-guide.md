# Docker部署指南 - Ubuntu系统

本指南将帮助您在Ubuntu系统上使用Docker部署Vue前端应用。

使用git克隆
```bash
git clone <your-repository-url>
cd work_hub
```

2. 构建并启动Docker容器

```bash
# 切换到项目目录
cd /path/to/work_hub

# 使用Docker Compose构建并启动容器
docker-compose up -d --build
```

3. 验证部署

部署完成后，可以通过服务器IP地址访问应用：
```
http://your_server_ip
```

## 常用操作命令

- 查看容器日志：
```bash
docker-compose logs -f
```

- 停止容器：
```bash
docker-compose down
```

- 重启容器：
```bash
docker-compose restart
```

- 更新应用（代码更新后）：
```bash
git pull  # 如果您使用Git管理代码
docker-compose down
docker-compose up -d --build
```

## 注意事项

1. 生产环境部署时，建议配置HTTPS。可以使用Nginx反向代理和Let's Encrypt实现。
·
2. 如果您的应用需要连接到后端API：
   - 确保在nginx.conf中正确配置了API代理
   - 确保服务器防火墙允许80端口（和443端口，如果使用HTTPS）

3. 如果遇到权限问题，请确保您的用户有足够的权限运行Docker命令。

4. 在生产环境中，应该考虑使用环境变量来配置后端API地址等参数，而不是硬编码在配置文件中。
