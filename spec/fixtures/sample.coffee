# Sample file for ensuring the regions get added.

output = ""

i = 1
while i <= 100
  string = "#{i} "
  string += 'Fizz'  if i % 3 is 0
  string += 'Buzz'  if i % 5 is 0
  output += "#{string}\n"
  i++
