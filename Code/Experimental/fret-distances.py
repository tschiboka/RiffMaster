
# Get Fret Distances of a Guitar Hero Console

distance = 0.43                                 # Total Lenth is 43cm
fret_num = 20                                   # The Maximum Fret on the Neck
fret_distances = []                             # Store Fret Distances
RATIO = 17.817                                  # Standart Ratio

for fret_index in range(fret_num):
    distance -= distance / RATIO                # Take Fret Distance from the Total
    formated = float("{:.3f}".format(distance)) # Format to 3 Decimal Point Precision
    fret_distances.append(formated)             # Store Distance
    
print(fret_distances)



