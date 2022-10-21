

import math

b_total = 20                            # Total Number of Buttons
r_circuit = 220000                      # 220 Ohm Before the Circuit
b_resistances = []                      # Collect Values in an Array in kOhms

for index in range(1, b_total):
    b_res = r_circuit / (1 - (index / b_total)) - r_circuit
    b_resistances.append((math.floor(b_res / 1000)))
print(b_resistances)



