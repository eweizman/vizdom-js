from random import randint
import csv
with open('fakedata.csv', 'w') as csvfile:
	writer = csv.writer(csvfile, delimiter=',')
	writer.writerow(['age', 'sex', 'race','salary'])
	for i in range(0,150):
		writer.writerow([randint(13,17), 
			('M' if randint(0,1) == 0 else 'F'),
			['American Indian', 'Asian', 'Black', 'Pacific Islander', 'White'][randint(0,4)],
			['<','>='][randint(0,1)] + '$10,000'])