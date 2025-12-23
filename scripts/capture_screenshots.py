from playwright.sync_api import sync_playwright
import os

OUT_DIR = 'screenshots'
URLS = ['http://localhost:8000/', 'http://localhost:8000/Thanks.html']
THEMES = ['light','dark','high-contrast']
MOTION = [False, True]

os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for url in URLS:
        for theme in THEMES:
            for reduced in MOTION:
                try:
                    context = browser.new_context(viewport={'width':1280,'height':900})
                    page = context.new_page()
                    print('Navigating', url, 'theme=', theme, 'reduced=', reduced)
                    # set preferences via localStorage before navigation
                    if theme == 'light':
                        page.add_init_script("() => localStorage.setItem('theme','light')")
                    elif theme == 'dark':
                        page.add_init_script("() => localStorage.setItem('theme','dark')")
                    elif theme == 'high-contrast':
                        page.add_init_script("() => localStorage.setItem('theme','high-contrast')")
                    else:
                        page.add_init_script("() => localStorage.removeItem('theme')")
                    if reduced:
                        page.add_init_script("() => localStorage.setItem('reduceMotion','1')")
                    else:
                        page.add_init_script("() => localStorage.setItem('reduceMotion','0')")
                    page.goto(url, wait_until='networkidle')
                    # small delay to let fonts load
                    page.wait_for_timeout(600)
                    fname = f"{OUT_DIR}/{os.path.basename(url.strip('/')) or 'index'}_{theme}{'_reduced' if reduced else ''}.png"
                    page.screenshot(path=fname, full_page=True)
                    print('Saved', fname)
                except Exception as e:
                    import traceback
                    print('ERROR for', url, theme, reduced)
                    traceback.print_exc()
                finally:
                    try:
                        context.close()
                    except:
                        pass
    browser.close()
