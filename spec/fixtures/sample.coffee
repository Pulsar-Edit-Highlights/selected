# Sample file for ensuring the regions get added.
# Output Fizz on multiples of 3, Output Buzz on multiples of 5
# Output FizzBuzz on multiples of 3 and 5

output = ""

i = 1
while i <= 100
  string = "#{i} "
  string += 'Fizz'  if i % 3 is 0
  string += 'Buzz'  if i % 5 is 0
  output += "#{string}\n"
  i++
