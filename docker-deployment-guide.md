# Docker部署指南 - Ubuntu系统

本指南将帮助您在Ubuntu系统上使用Docker部署Vue前端应用。

## 前提条件

1. 一台运行Ubuntu系统的服务器
2. 已安装Docker和Docker Compose

如果尚未安装Docker和Docker Compose，请按照以下步骤进行安装：

```bash
# 更新软件包索引
sudo apt update

# 安装必要的依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加Docker仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新软件包索引
sudo apt update

# 安装Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组，避免每次使用docker命令都需要sudo
sudo usermod -aG docker $USER

# 应用组更改（重新登录后生效）
newgrp docker
```

## 部署步骤

1. 将项目文件传输到Ubuntu服务器

```bash
# 使用scp命令从本地复制项目到服务器
# 替换 your_username 和 your_server_ip 为您的服务器信息
scp -r content_hub_f your_username@your_server_ip:/path/to/destination
```

或者使用Git克隆：

```bash
git clone <your-repository-url>
cd content_hub_f
```

2. 构建并启动Docker容器

```bash
# 切换到项目目录
cd /path/to/content_hub_f

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

2. 如果您的应用需要连接到后端API：
   - 确保在nginx.conf中正确配置了API代理
   - 确保服务器防火墙允许80端口（和443端口，如果使用HTTPS）

3. 如果遇到权限问题，请确保您的用户有足够的权限运行Docker命令。

4. 在生产环境中，应该考虑使用环境变量来配置后端API地址等参数，而不是硬编码在配置文件中。
