import pandas as pd


def strip_data(data_path):
    df = pd.read_csv(data_path)
    df = df.drop(['country', 'date_documented', 'report_link'], axis=1)
    df.to_csv('ufo_sightings_final.csv', index=False)

if __name__ == '__main__':
    # File is really large, strip any columns not used by the visualization
    data_path = 'ufo_sightings_enhanced.csv'

    strip_data(data_path)