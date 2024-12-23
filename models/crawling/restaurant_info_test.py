#!/usr/bin/env python
# coding: utf-8

# In[1]:


from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
import requests
from bs4 import BeautifulSoup
from openpyxl import Workbook
import json
import csv


# In[4]:


pip install chromedriver


# In[19]:


## 식당 정보 출력 테스트

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import csv
import json

# WebDriver 설정
driver = webdriver.Chrome()

# 대상 URL 리스트
urls = [
    "https://www.diningcode.com/profile.php?rid=0VWJp3bySR6o",  # 테스트용 링크
]

# 결과 저장용 리스트
restaurant_data = []

def get_restaurant_details(url):
    driver.get(url)
    time.sleep(3)  # 페이지 로딩 대기

    # 식당 이름
    try:
        name = driver.find_element(By.TAG_NAME, "h1").text.strip()
    except:
        name = "정보 없음"

    # 주소
    try:
        address_element = driver.find_element(By.CSS_SELECTOR, "li.locat")
        address = address_element.text.replace("지번", "").replace("지도보기", "").strip()
    except:
        address = "정보 없음"

    # 전화번호
    try:
        phone = driver.find_element(By.CSS_SELECTOR, "li.tel").text.strip()
    except:
        phone = "정보 없음"

    # 메뉴 정보 수집
    def get_menu_info():
        # "더보기" 버튼 클릭
        while True:
            try:
                more_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "a.more-btn[onclick*='menu-info']"))
                )
                driver.execute_script("arguments[0].scrollIntoView(true);", more_button)
                driver.execute_script("arguments[0].click();", more_button)
                time.sleep(2)  # 클릭 후 대기
            except:
                print("메뉴 더보기 버튼이 더 이상 존재하지 않습니다.")
                break

        # BeautifulSoup로 메뉴 데이터 추출
        soup = BeautifulSoup(driver.page_source, "html.parser")
        menu_items = soup.select("div.menu-info li")
        menu_info = []
        for item in menu_items:
            try:
                name = item.select_one(".Restaurant_Menu").get_text(strip=True)
                price = item.select_one(".Restaurant_MenuPrice").get_text(strip=True)
                menu_info.append(f"{name}: {price}")
            except:
                continue
        return "\n".join(menu_info)

    menu_info = get_menu_info()

    # 최종 결과 반환
    return {
        "이름": name,
        "주소": address,
        "전화번호": phone,
        "메뉴": menu_info
    }

# 각 URL을 순회하면서 정보 수집
for url in urls:
    print(f"URL 수집 중: {url}")
    restaurant_details = get_restaurant_details(url)
    restaurant_data.append(restaurant_details)

# CSV 저장
csv_file = "restaurant_details.csv"
with open(csv_file, "w", encoding="utf-8-sig", newline="") as file:
    fieldnames = ["이름", "주소", "전화번호", "메뉴"]
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(restaurant_data)

# JSON 저장
json_file = "restaurant_details.json"
with open(json_file, "w", encoding="utf-8-sig") as file:
    json.dump(restaurant_data, file, ensure_ascii=False, indent=4)

print(f"데이터 수집 및 저장 완료! CSV: {csv_file}, JSON: {json_file}")

driver.quit()


# In[ ]:




