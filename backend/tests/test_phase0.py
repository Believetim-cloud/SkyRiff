"""
Phase 0 测试脚本
测试用户登录和钱包系统
"""
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

# 测试手机号
TEST_PHONE = "13800138000"


def test_send_sms():
    """测试发送短信验证码"""
    print("\n📱 测试1：发送短信验证码")
    url = f"{BASE_URL}/auth/send_sms"
    data = {
        "phone": TEST_PHONE,
        "purpose": "login"
    }
    
    response = requests.post(url, json=data)
    print(f"  状态码: {response.status_code}")
    print(f"  响应: {response.json()}")
    
    assert response.status_code == 200
    print("  ✅ 发送成功")


def test_login(code: str):
    """测试手机登录"""
    print("\n🔐 测试2：手机登录")
    url = f"{BASE_URL}/auth/login/phone"
    data = {
        "phone": TEST_PHONE,
        "code": code
    }
    
    response = requests.post(url, json=data)
    print(f"  状态码: {response.status_code}")
    result = response.json()
    print(f"  响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    assert response.status_code == 200
    assert "data" in result
    assert "token" in result["data"]
    
    token = result["data"]["token"]
    is_new_user = result["data"]["is_new_user"]
    
    print(f"  ✅ 登录成功")
    print(f"  Token: {token[:50]}...")
    print(f"  新用户: {is_new_user}")
    
    return token


def test_get_profile(token: str):
    """测试获取用户资料"""
    print("\n👤 测试3：获取用户资料")
    url = f"{BASE_URL}/users/me"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    print(f"  状态码: {response.status_code}")
    result = response.json()
    print(f"  响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    assert response.status_code == 200
    print("  ✅ 获取成功")


def test_get_wallets(token: str):
    """测试获取钱包余额"""
    print("\n💰 测试4：获取钱包余额")
    url = f"{BASE_URL}/wallets/me"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    print(f"  状态码: {response.status_code}")
    result = response.json()
    print(f"  响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    assert response.status_code == 200
    assert result["data"]["credits"] == 0  # 新用户积分为0
    print("  ✅ 获取成功")


def test_get_credit_ledgers(token: str):
    """测试获取积分流水"""
    print("\n📊 测试5：获取积分流水")
    url = f"{BASE_URL}/wallets/ledgers/credits"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    print(f"  状态码: {response.status_code}")
    result = response.json()
    print(f"  响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    assert response.status_code == 200
    print("  ✅ 获取成功")


def main():
    """主测试流程"""
    print("=" * 60)
    print("Phase 0 自动化测试")
    print("=" * 60)
    
    # 先检查服务是否运行
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code != 200:
            print("❌ 服务未运行，请先启动后端服务")
            return
    except Exception:
        print("❌ 无法连接到服务器，请先启动后端服务：")
        print("   cd backend && python -m app.main")
        return
    
    try:
        # 1. 发送验证码
        test_send_sms()
        
        # 2. 获取验证码（从控制台输入，开发环境会打印）
        print("\n请从后端控制台查看验证码，然后输入：")
        code = input("验证码: ").strip()
        
        # 3. 登录
        token = test_login(code)
        
        # 4. 获取用户资料
        test_get_profile(token)
        
        # 5. 获取钱包余额
        test_get_wallets(token)
        
        # 6. 获取积分流水
        test_get_credit_ledgers(token)
        
        print("\n" + "=" * 60)
        print("✅ 所有测试通过！Phase 0 开发完成！")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n❌ 测试失败: {e}")
    except Exception as e:
        print(f"\n❌ 错误: {e}")


if __name__ == "__main__":
    main()
