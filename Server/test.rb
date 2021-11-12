userMsg = "[uname,xcd]"

# gets the value [HERE,text]              
header = userMsg.split(/,/)[0][1..-1]
# gets the value [msg,HERE]        
data = userMsg.split(/,/)[1][0..-2]

username = data.split(/;/)[1]

puts header
puts data
puts username.inspect