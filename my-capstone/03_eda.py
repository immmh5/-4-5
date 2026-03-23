import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler

# Load featured data
df = pd.read_csv('data/cleaned/AmesHousing_featured.csv')

# --- EDA TASKS ---

# 1. Histograms / KDE
plt.figure(figsize=(15, 5))
cols_to_plot = ['SalePrice', 'GrLivArea', 'LotArea']
for i, col in enumerate(cols_to_plot):
    plt.subplot(1, 3, i+1)
    sns.histplot(df[col], kde=True)
    plt.title(f'Distribution of {col}')
plt.tight_layout()
plt.savefig('eda_histograms.png')
# Insight: SalePrice and LotArea are right-skewed, while GrLivArea is more normally distributed but still slightly skewed.

# 2. Grouped boxplots
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
sns.boxplot(x='HouseAgeGroup', y='SalePrice', data=df)
plt.title('SalePrice by House Age Group')

plt.subplot(1, 2, 2)
sns.boxplot(x='CentralAir', y='SalePrice', data=df)
plt.title('SalePrice by Central Air')
plt.savefig('eda_boxplots.png')
# Insight: Newer houses tend to have higher sale prices. Houses with Central Air also command a significant premium.

# 3. Correlation heatmap
plt.figure(figsize=(10, 8))
top_10_corr = df.select_dtypes(include=[np.number]).corr()['SalePrice'].sort_values(ascending=False).head(11)
sns.heatmap(df[top_10_corr.index].corr(), annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Top 10 Features Correlated with SalePrice')
plt.savefig('eda_heatmap.png')
# Insight: OverallQual and GrLivArea are the strongest predictors of SalePrice.

# 4. Scatter plot
plt.figure(figsize=(10, 6))
sns.scatterplot(x='GrLivArea', y='SalePrice', hue='OverallQual', size='TotalBath', data=df, palette='viridis')
plt.title('SalePrice vs GrLivArea (Hue: Quality, Size: Bathrooms)')
plt.savefig('eda_scatter.png')
# Insight: There is a clear linear relationship between living area and price, further amplified by house quality.

# 5. Groupby summary
summary = df.groupby('HouseAgeGroup')['SalePrice'].mean().sort_values(ascending=False)
print("\nMean SalePrice by House Age Group:")
print(summary)
# Insight: 'New' houses (built after 2000) have the highest average price, while 'Old' houses (pre-1950) have the lowest.

# --- MATH BASICS TASKS ---

# 1. Compute mean and std manually using NumPy
target = df['SalePrice'].values
mean_manual = np.sum(target) / len(target)
std_manual = np.sqrt(np.sum((target - mean_manual)**2) / len(target))
print(f"\nManual Mean: {mean_manual:.2f}, Manual Std: {std_manual:.2f}")

# 2. Standardise one column by hand using broadcasting
X = df['GrLivArea'].values
mean_X = np.mean(X)
std_X = np.std(X)
z_manual = (X - mean_X) / std_X

# Compare with StandardScaler
scaler = StandardScaler()
z_sklearn = scaler.fit_transform(X.reshape(-1, 1)).flatten()
print(f"Manual vs Sklearn Z-score difference (sum): {np.sum(np.abs(z_manual - z_sklearn)):.10f}")

# 3. Cosine similarity
def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# Correctly select numeric columns first, then get the row
numeric_df = df.select_dtypes(include=[np.number])
high_val = numeric_df.loc[df['SalePrice'].idxmax()].values
low_val = numeric_df.loc[df['SalePrice'].idxmin()].values
# Handle NaNs if any (though we cleaned them)
high_val = np.nan_to_num(high_val)
low_val = np.nan_to_num(low_val)

sim = cosine_similarity(high_val, low_val)
print(f"Cosine Similarity between highest and lowest value records: {sim:.4f}")

# 4. Estimate a probability
# Fraction of high-quality items (OverallQual >= 8) that have SalePrice > 300,000
high_qual = df[df['OverallQual'] >= 8]
prob = (high_qual['SalePrice'] > 300000).mean()
print(f"Probability that a high-quality house (Qual >= 8) costs > $300k: {prob:.4f}")

print("\nEDA and Math tasks completed.")
