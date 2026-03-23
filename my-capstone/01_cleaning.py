import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# 1. Load the data
df = pd.read_csv('data/raw/AmesHousing.csv')
print("First 5 rows:")
print(df.head())

# 2. Check the shape
print(f"\nShape of the dataset: {df.shape}")

# 3. Inspect data types
print("\nData Info:")
df.info()

# Fix at least 2 wrong data types
# 'MSSubClass' is categorical but represented as int
df['MSSubClass'] = df['MSSubClass'].astype(str)
# 'Mo Sold' is also categorical (month)
if 'Mo Sold' in df.columns:
    df['Mo Sold'] = df['Mo Sold'].astype(str)

# 4. Find missing values
missing = df.isnull().sum()
print("\nMissing values per column (top 10):")
print(missing[missing > 0].sort_values(ascending=False).head(10))

# Handle missing values
# For numerical columns, fill with median; for categorical, fill with 'None' or mode
def handle_missing(df):
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == 'object':
                df[col] = df[col].fillna('None')
            else:
                df[col] = df[col].fillna(df[col].median())
    return df

df = handle_missing(df)

# 5. Handle duplicates
duplicates = df.duplicated().sum()
print(f"\nNumber of duplicates: {duplicates}")
if duplicates > 0:
    df = df.drop_duplicates()

# 6. Spot outliers in target column (SalePrice)
target_col = 'SalePrice'
plt.figure(figsize=(10, 6))
sns.boxplot(x=df[target_col])
plt.title('Boxplot of SalePrice before capping')
plt.savefig('saleprice_boxplot_before.png')

# Cap extreme values at the 99th percentile
upper_limit = df[target_col].quantile(0.99)
df[target_col] = np.where(df[target_col] > upper_limit, upper_limit, df[target_col])

# 7. clean_data() function
def clean_data(raw_df):
    df_clean = raw_df.copy()
    
    # Fix types
    df_clean['MSSubClass'] = df_clean['MSSubClass'].astype(str)
    if 'Mo Sold' in df_clean.columns:
        df_clean['Mo Sold'] = df_clean['Mo Sold'].astype(str)
        
    # Handle missing
    for col in df_clean.columns:
        if df_clean[col].isnull().sum() > 0:
            if df_clean[col].dtype == 'object':
                df_clean[col] = df_clean[col].fillna('None')
            else:
                df_clean[col] = df_clean[col].fillna(df_clean[col].median())
                
    # Duplicates
    df_clean = df_clean.drop_duplicates()
    
    # Outliers
    upper = df_clean['SalePrice'].quantile(0.99)
    df_clean['SalePrice'] = np.where(df_clean['SalePrice'] > upper, upper, df_clean['SalePrice'])
    
    return df_clean

# 8. Checks
print("\nFinal Checks:")
print(f"Any nulls? {df.isnull().sum().sum()}")
print(f"All SalePrice > 0? {(df['SalePrice'] > 0).all()}")
print(f"Shape after cleaning: {df.shape}")

# Save cleaned data
df.to_csv('data/cleaned/AmesHousing_cleaned.csv', index=False)
print("\nCleaned data saved to data/cleaned/AmesHousing_cleaned.csv")
