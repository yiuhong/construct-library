# Fair-coin payoffs.
# Heads pays 1, tails pays 0. E[X] = p * 1 + (1 - p) * 0.
# plt.show() sends the figure to the Graph panel. The console stays text.
import matplotlib.pyplot as plt

heads = 1
tails = 0
p = 0.5
E = p * heads + (1 - p) * tails
print(E)

fig, ax = plt.subplots(figsize=(4.4, 2.2), layout="constrained")
ax.bar(["heads", "tails"], [heads, tails], color=["#1c1c1c", "#cfcfcf"], width=0.62)
ax.set_ylabel("payoff")
ax.set_title(f"E[X] = {E}")
plt.show()
