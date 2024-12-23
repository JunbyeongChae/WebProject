#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import csv
import json

# User-Agent 설정 및 Selenium WebDriver 옵션 추가
def setup_driver():
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    return driver

# RID 수집
def get_rid_from_list_page(url, max_rid=100):
    driver.get(url)
    try:
        scrollable_div = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.Poi__List__Wrap"))
        )
    except Exception as e:
        print(f"요소 로드 실패: {e}")
        return []

    rid_list = set()
    last_height = 0
    scroll_count = 0

    while len(rid_list) < max_rid:
        soup = BeautifulSoup(driver.page_source, "html.parser")
        restaurant_links = soup.select("a.PoiBlock")
        
        for link in restaurant_links:
            href = link.get("href", "")
            if "rid=" in href:
                rid = href.split("rid=")[-1]
                rid_list.add(rid)
                if len(rid_list) >= max_rid:
                    break

        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scrollable_div)
        time.sleep(2)

        new_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_div)
        if new_height == last_height:
            break
        
        last_height = new_height
        scroll_count += 1
        print(f"스크롤 횟수: {scroll_count}, 수집된 RID 개수: {len(rid_list)}")

    return list(rid_list)

# 식당 세부 정보 수집
def get_restaurant_details(rid):
    url = f"https://www.diningcode.com/profile.php?rid={rid}"
    driver.get(url)
    time.sleep(3)

    try:
        name = driver.find_element(By.TAG_NAME, "h1").text.strip()
    except:
        name = "정보 없음"

    try:
        address = driver.find_element(By.CSS_SELECTOR, "li.locat").text.strip()
    except:
        address = "정보 없음"

    try:
        phone = driver.find_element(By.CSS_SELECTOR, "li.tel").text.strip()
    except:
        phone = "정보 없음"

    # 메뉴 정보 수집
    def get_menu_info():
        while True:
            try:
                more_button = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "a.more-btn[onclick*='menu-info']"))
                )
                driver.execute_script("arguments[0].click();", more_button)
                time.sleep(1)
            except:
                break

        soup = BeautifulSoup(driver.page_source, "html.parser")
        menu_items = soup.select("div.menu-info li")
        menu_info = []
        for item in menu_items:
            try:
                menu_name = item.select_one(".Restaurant_Menu").get_text(strip=True)
                menu_price = item.select_one(".Restaurant_MenuPrice").get_text(strip=True)
                menu_info.append(f"{menu_name}: {menu_price}")
            except:
                continue
        return "\n".join(menu_info)

    # 영업시간 정보 수집
    def get_opening_hours():
        try:
            try:
                more_button = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "a.more-btn[onclick*='busi-hours']"))
                )
                driver.execute_script("arguments[0].click();", more_button)
                time.sleep(1)
            except:
                pass

            soup = BeautifulSoup(driver.page_source, "html.parser")
            opening_hours = {}
            ordered_days = ["월", "화", "수", "목", "금", "토", "일"]

            # 당일 영업시간 추출
            today_section = soup.select_one("div.busi-hours-today ul.list")
            if today_section:
                today_items = today_section.find_all("li")
                today_data = {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}
                for item in today_items:
                    text = item.get_text(strip=True)
                    if "휴무일" in text:
                        today_data = {"영업시간": "휴무일"}
                        break
                    if "영업시간" in text:
                        today_data["영업시간"] = text.replace("영업시간: ", "").strip()
                    elif "브레이크타임" in text:
                        today_data["브레이크타임"] = text.replace("브레이크타임: ", "").strip()
                    elif "라스트오더" in text:
                        today_data["라스트오더"] = text.replace("라스트오더: ", "").strip()
                today_day = soup.select_one("div.busi-hours-today li p.l-txt strong").text.strip().split("(")[-1].replace(")", "")
                opening_hours[today_day] = today_data

            # 주간 영업시간 추출
            week_section = soup.select_one("div.busi-hours ul.list")
            if week_section:
                week_items = week_section.find_all("li")
                current_day = None
                for item in week_items:
                    day_text = item.select_one(".l-txt").get_text(strip=True) if item.select_one(".l-txt") else None
                    time_text = item.select_one(".r-txt").get_text(strip=True) if item.select_one(".r-txt") else None
                    if day_text:
                        current_day = day_text.split(" ")[-1].replace("(", "").replace(")", "")
                        if current_day in opening_hours:
                            continue
                        opening_hours[current_day] = {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}
                    if current_day and time_text:
                        if "휴무일" in time_text:
                            opening_hours[current_day] = {"영업시간": "휴무일"}
                            continue
                        if "영업시간" in time_text:
                            opening_hours[current_day]["영업시간"] = time_text.replace("영업시간: ", "").strip()
                        elif "브레이크타임" in time_text:
                            opening_hours[current_day]["브레이크타임"] = time_text.replace("브레이크타임: ", "").strip()
                        elif "라스트오더" in time_text:
                            opening_hours[current_day]["라스트오더"] = time_text.replace("라스트오더: ", "").strip()

            sorted_hours = {day: opening_hours.get(day, {"영업시간": "정보 없음", "브레이크타임": "브레이크타임 없음", "라스트오더": "라스트오더 없음"}) for day in ordered_days}
            return json.dumps(sorted_hours, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"영업시간 수집 실패: {e}")
            return "정보 없음"

    menu_info = get_menu_info()

    # 메뉴 정보가 없는 경우 None 반환
    if not menu_info.strip():
        return None

    opening_hours = get_opening_hours()

    return {
        "이름": name,
        "주소": address,
        "전화번호": phone,
        "메뉴": menu_info,
        "영업시간": opening_hours
    }

# 전체 데이터 수집
def get_restaurant_data(query):
    base_url = f"https://www.diningcode.com/list.dc?query={query}"
    rids = get_rid_from_list_page(base_url, max_rid=100)
    restaurant_data = []

    for idx, rid in enumerate(rids):
        print(f"식당 정보 수집 중 ({idx + 1}/{len(rids)}): RID={rid}")
        details = get_restaurant_details(rid)
        if details:  # 메뉴 정보가 있는 경우만 추가
            restaurant_data.append(details)
    return restaurant_data

# 메인 코드 실행
if __name__ == "__main__":
    driver = setup_driver()
    query_list = ["광명시 한식", "광명시 중식", "광명시 양식", "광명시 일식", "광명시 카페", 
                  "금천구 한식", "금천구 중식", "금천구 양식", "금천구 일식", "금천구 카페", 
                  "구로구 한식", "구로구 중식", "구로구 양식", "구로구 일식", "구로구 카페"]

    for query in query_list:
        print(f"'{query}' 검색어로 데이터 수집 시작...")
        new_data = get_restaurant_data(query)

        csv_file = f"{query.replace(' ', '_')}_data.csv"
        json_file = f"{query.replace(' ', '_')}_data.json"

        with open(csv_file, "w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=["이름", "주소", "전화번호", "메뉴", "영업시간"])
            writer.writeheader()
            writer.writerows(new_data)

        with open(json_file, "w", encoding="utf-8-sig") as file:
            json.dump(new_data, file, ensure_ascii=False, indent=4)

        print(f"'{query}' 데이터 수집 완료! CSV: {csv_file}, JSON: {json_file}")

    driver.quit()


# In[ ]:




