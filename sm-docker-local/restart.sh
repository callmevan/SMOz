#!/usr/bin/env bash
# SMOz 项目一键恢复脚本
# 用法: ./restart.sh

set -e  # 遇到错误立即退出

echo "🔄 SMOz 项目服务恢复脚本"
echo "================================"
echo ""

# 获取脚本所在目录
cd "$(dirname "$0")"

# 启动所有服务
echo "🚀 正在启动所有服务..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ 启动失败！请检查 Docker 是否运行。"
    exit 1
fi

echo "✅ 服务启动命令已执行"
echo ""

# 等待服务启动
echo "⏳ 等待服务初始化（30秒）..."
sleep 30

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
services=("traefik" "token-server" "sm-web-client" "orchestration-server" "oz-server")
all_up=true

for service in "${services[@]}"; do
    status=$(docker inspect -f '{{.State.Status}}' "$service" 2>/dev/null || echo "not found")
    if [ "$status" == "running" ]; then
        echo "✅ $service: running"
    else
        echo "❌ $service: $status"
        all_up=false
    fi
done

if [ "$all_up" = false ]; then
    echo ""
    echo "⚠️  部分服务启动失败，请查看日志"
fi

# 继续等待 Web-Client 编译
echo ""
echo "📦 等待 Web-Client 编译（额外30秒）..."
sleep 30

# 检查 Web-Client 编译状态
echo ""
echo "🔍 检查 Web-Client 编译状态..."
if docker logs sm-web-client --tail=50 2>&1 | grep -q "Compiled successfully"; then
    echo "✅ Web-Client 编译成功！"
else
    echo "⚠️  Web-Client 可能还在编译中..."
    echo "   运行以下命令查看进度：docker logs sm-web-client -f"
fi

# 检查 Token-Server
echo ""
echo "🔍 检查 Token-Server 状态..."
if docker logs token-server 2>&1 | grep -q "Express server listening"; then
    echo "✅ Token-Server 运行正常！"
else
    echo "❌ Token-Server 可能有问题"
    echo "   运行以下命令查看详情：docker logs token-server"
fi

# 重启 Traefik 确保路由注册
echo ""
echo "🔄 重启 Traefik 以确保路由注册..."
docker-compose restart reverse-proxy > /dev/null 2>&1
sleep 15

# 检查路由
echo ""
echo "🌐 检查已注册的路由..."
routes=("sm-web.app.localhost" "token-server.app.localhost" "orchestration-server.app.localhost" "oz-server.app.localhost")
all_routes_ok=true

for route in "${routes[@]}"; do
    if docker logs traefik --tail=100 2>&1 | grep -q "$route"; then
        echo "✅ $route"
    else
        echo "❌ $route 未注册"
        all_routes_ok=false
    fi
done

if [ "$all_routes_ok" = false ]; then
    echo ""
    echo "⚠️  部分路由未注册，可能需要再次重启 Traefik"
fi

# 最终状态
echo ""
echo "================================"
echo "✅ 服务恢复完成！"
echo "================================"
echo ""

echo "🌐 访问地址："
echo "   https://sm-web.app.localhost"
echo ""

echo "⚠️  首次访问需要接受证书（依次访问以下地址）："
echo "   1. https://sm-web.app.localhost"
echo "   2. https://token-server.app.localhost"
echo "   3. https://orchestration-server.app.localhost"
echo "   4. https://oz-server.app.localhost"
echo "   每个都点击 '高级' → '继续访问'"
echo ""

echo "💡 提示："
echo "   - 如果页面还是 404，等待 1-2 分钟后刷新"
echo "   - 查看日志：docker logs sm-web-client -f"
echo "   - 查看所有服务：docker-compose ps"
echo ""

