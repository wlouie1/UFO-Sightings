import pandas as pd
import numpy as np
from html.parser import HTMLParser
from urllib.request import urlopen
from bs4 import BeautifulSoup


def process_data(events_path, reports_path, data_path):
    df = pd.read_csv(data_path)
    df_events = pd.read_csv(events_path)
    df_reports = pd.read_csv(reports_path)

    df['description'] = df['description'].astype(str)
    df_events['summary'] = df_events['summary'].astype(str)

    df = df.drop(['duration_seconds'], axis=1)

    report_links = []
    original_descriptions = df['description'].values
    reference_descriptions = df_events['summary'].values
    ref_desc_map = {ref_desc.lower().strip(): i for i, ref_desc in enumerate(reference_descriptions)}
    ref_desc_trunc_map = {ref_desc.lower().strip()[-25:]: i for i, ref_desc in enumerate(reference_descriptions)}
    ref_desc_frunc_map = {ref_desc.lower().strip()[0:25]: i for i, ref_desc in enumerate(reference_descriptions)}
    pars = HTMLParser()

    failed = 0
    success = 0
    for i, desc in enumerate(df['description'].values):
        desc_cleaned = pars.unescape(desc.lower().strip())
        if desc_cleaned in ref_desc_map:
            ind = ref_desc_map[desc_cleaned]
            success += 1
        elif desc_cleaned[-25:] in ref_desc_trunc_map:
            ind = ref_desc_trunc_map[desc_cleaned[-25:]]
            success += 1
        elif desc_cleaned[0:25] in ref_desc_frunc_map:
            ind = ref_desc_frunc_map[desc_cleaned[0:25]]
            success += 1
        else:
            print(desc_cleaned)
            print("failed")
            failed += 1
            print()
            report_links.append(np.nan)
            continue
        
        report_links.append(df_events['event_url'].iloc[ind])        
    print(failed, success)

    df['report_link'] = pd.Series(report_links)
    df = df.dropna(subset=['report_link'])

    df_reports = df_reports.dropna(subset=['report_link'])
    links_map = {link:i for i, link in enumerate(df_reports['report_link'].values)}

    full_descriptions = []
    links = df['report_link'].values

    visited_links = {}
    for i, link in enumerate(links):
        if i % 10 == 0:
            print(i, len(links))

        if link in visited_links:
            full_descriptions.append(visited_links[link])
            continue

        if link in links_map:
            full_desc = df_reports['text'].iloc[links_map[link]]
            full_descriptions.append(full_desc)
            visited_links[link] = full_desc
        else:
            try:
                page = urlopen(link)
                soup = BeautifulSoup(page, 'html.parser')
                tds = soup.find_all('td')
                full_desc = tds[-1].get_text()
                full_descriptions.append(full_desc)
                visited_links[link] = full_desc
            except:
                full_desc = df['description'].iloc[i]
                full_descriptions.append(full_desc)
                visited_links[link] = full_desc

    df['description'] = pd.Series(full_descriptions)

    print(df.shape)

    df.to_csv('ufo_sightings_final.csv', index=False)


if __name__ == '__main__':
    # This dataset was scraped, geolocated, and time standardized from NUFORC data, and hosted here by Sigmond Axel.
    # Specifically, I used the scrubbed dataset, and added column headers to create ufo_sightings.csv (done manually).
    # However, this dataset doesn't contain the report full texts.
    data_path = 'ufo_sightings_original.csv'

    # Prescraped dataset here is https://data.world/khturner/national-ufo-reporting-center-reports
    # but otherwise can be scraped from NUFORC yourself as per https://github.com/khturner/nuforc_data/blob/master/scrape_nuforc_by_event_date.R
    # Contains NUFORC report web links, but not geo location data...
    events_path = 'nuforc_events.csv'

    # Prescraped dataset used here is from https://data.world/timothyrenner/ufo-sightings
    # but otherwise can be scraped from NUFORC yourself as per https://github.com/timothyrenner/nuforc_sightings_data
    # Contains fewer data points than 'ufo_sightings_original.csv', but contains full report text
    report_path = 'nuforc_reports.csv'

    # Ugh...basically we want 'ufo_sightings_original.csv' plus full report text information.
    # Here, we use 'nuforc_reports.csv' to get as many full texts as possible
    # For the remaining ones, use 'nuforc_events.csv' to get the NUFORC web links and scrape the webpage for full text
    # Throw out the rest that we can't resolve (turns out there are only around 56/80K we need to throw out)
    # Final dataset is 'ufo_sightings_final.csv'
    process_data(events_path, report_path, data_path)