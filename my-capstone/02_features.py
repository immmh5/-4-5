import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

# Load cleaned data
df = pd.read_csv('data/cleaned/AmesHousing_cleaned.csv')

# 1. One-hot encode at least 2 categorical columns
# Choosing 'MSZoning' and 'Street'
df = pd.get_dummies(df, columns=['MSZoning', 'Street'], prefix=['Zoning', 'Street'])

# 2. Ordinal encode 1 ordered column
# 'ExterQual' (Ex: Excellent, Gd: Good, TA: Typical/Average, Fa: Fair, Po: Poor)
qual_map = {'Ex': 5, 'Gd': 4, 'TA': 3, 'Fa': 2, 'Po': 1, 'None': 0}
df['ExterQual_Num'] = df['ExterQual'].map(qual_map)

# 3. Scale at least 2 numerical columns
scaler = StandardScaler()
df[['GrLivArea_Scaled', 'LotArea_Scaled']] = scaler.fit_transform(df[['GrLivArea', 'LotArea']])

# 4. Create 2 domain features
# Feature 1: Price per square foot
df['PricePerSqFt'] = df['SalePrice'] / (df['GrLivArea'] + 1) # Safe division

# Feature 2: Total Bathrooms
df['TotalBath'] = df['FullBath'] + (0.5 * df['HalfBath']) + df['BsmtFullBath'] + (0.5 * df['BsmtHalfBath'])

# 5. Create 1 interaction feature
# OverallQual * GrLivArea
df['Qual_Area_Interact'] = df['OverallQual'] * df['GrLivArea']

# 6. Log-transform 1 skewed column
# 'LotArea' is usually skewed
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
sns.histplot(df['LotArea'], kde=True)
plt.title('LotArea Before Log Transform')

df['Log_LotArea'] = np.log1p(df['LotArea'])

plt.subplot(1, 2, 2)
sns.histplot(df['Log_LotArea'], kde=True)
plt.title('LotArea After Log Transform')
plt.savefig('lotarea_transform.png')

# 7. Bin 1 column into meaningful groups
# 'YearBuilt' into 'Old', 'Recent', 'New'
bins = [0, 1950, 2000, 2026]
labels = ['Old', 'Recent', 'New']
df['HouseAgeGroup'] = pd.cut(df['YearBuilt'], bins=bins, labels=labels)

# 8. Remove redundant features (r > 0.95)
corr_matrix = df.select_dtypes(include=[np.number]).corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop = [column for column in upper.columns if any(upper[column] > 0.95)]
print(f"\nRedundant columns to drop: {to_drop}")
df = df.drop(columns=to_drop)

# Save featured data
df.to_csv('data/cleaned/AmesHousing_featured.csv', index=False)
print("\nFeatured data saved to data/cleaned/AmesHousing_featured.csv")
