#!/usr/bin/env python
# coding: utf-8

# In[11]:


### 시간 출력 테스트

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# WebDriver 설정
driver = webdriver.Chrome()

# 대상 URL
target_url = "https://www.diningcode.com/profile.php?rid=tDrHoxh8UGWU"

def get_opening_hours(url):
    driver.get(url)
    time.sleep(5)  # 페이지 로딩 대기

    # "더보기" 버튼 클릭
    try:
        more_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.more-btn"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", more_button)
        driver.execute_script("arguments[0].click();", more_button)
        print("더보기 버튼 클릭 성공")
        time.sleep(3)  # 버튼 클릭 후 대기
    except Exception as e:
        print("더보기 버튼 클릭 실패 또는 이미 로드됨:", e)

    opening_hours = {}
    ordered_days = ["월", "화", "수", "목", "금", "토", "일"]

    # 당일 영업시간 추출
    try:
        today_section = driver.find_element(By.CSS_SELECTOR, "div.busi-hours-today ul.list")
        today_items = today_section.find_elements(By.TAG_NAME, "li")
        today_data = {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}
        for item in today_items:
            text = item.find_element(By.CLASS_NAME, "r-txt").text.strip()
            if "휴무일" in text:
                today_data = {"영업시간": "휴무일"}
                break
            if "영업시간" in text:
                today_data["영업시간"] = text.replace("영업시간: ", "").strip()
            elif "브레이크타임" in text:
                today_data["브레이크타임"] = text.replace("브레이크타임: ", "").strip()
            elif "라스트오더" in text:
                today_data["라스트오더"] = text.replace("라스트오더: ", "").strip()
        
        # 오늘 날짜에 해당하는 요일 추출
        today_day = driver.find_element(By.CSS_SELECTOR, "div.busi-hours-today li p.l-txt strong").text.strip()
        today_day = today_day.split("(")[-1].replace(")", "")  # "목"과 같은 요일만 추출
        opening_hours[today_day] = today_data
        print(f"오늘의 영업시간 ({today_day}): {today_data}")
    except Exception as e:
        print("당일 영업시간 추출 실패:", e)

    # 주간 영업시간 추출
    try:
        week_section = driver.find_element(By.CSS_SELECTOR, "div.busi-hours ul.list")
        week_items = week_section.find_elements(By.TAG_NAME, "li")

        current_day = None
        for item in week_items:
            day_element = item.find_element(By.CLASS_NAME, "l-txt").text.strip()
            if day_element:
                # 요일만 추출
                current_day = day_element.split(" ")[-1].replace("(", "").replace(")", "")
                # 이미 당일 데이터가 있는 경우 건너뜀
                if current_day in opening_hours:
                    continue
                opening_hours[current_day] = {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}
            if current_day:
                time_text = item.find_element(By.CLASS_NAME, "r-txt").text.strip()
                if "휴무일" in time_text:
                    opening_hours[current_day] = {"영업시간": "휴무일"}
                    continue
                if "영업시간" in time_text:
                    opening_hours[current_day]["영업시간"] = time_text.replace("영업시간: ", "").strip()
                elif "브레이크타임" in time_text:
                    opening_hours[current_day]["브레이크타임"] = time_text.replace("브레이크타임: ", "").strip()
                elif "라스트오더" in time_text:
                    opening_hours[current_day]["라스트오더"] = time_text.replace("라스트오더: ", "").strip()
    except Exception as e:
        print("주간 영업시간 추출 실패:", e)

    # 요일 순서대로 정렬
    sorted_hours = {day: opening_hours.get(day, {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}) for day in ordered_days}
    return sorted_hours

# 영업시간 정보 수집
print("영업시간 정보 수집 중...")
weekly_hours = get_opening_hours(target_url)

# 결과 출력
print("\n정리된 영업시간:")
for day, hours in weekly_hours.items():
    if hours["영업시간"] == "휴무일":
        print(f"{day}: 휴무일")
    else:
        print(f"{day}: 영업시간: {hours['영업시간']}, 브레이크타임: {hours['브레이크타임']}, 라스트오더: {hours['라스트오더']}")

# WebDriver 종료
driver.quit()


# In[ ]:




