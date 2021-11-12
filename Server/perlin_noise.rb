class Vector2 < Struct.new(:x, :y)
  def dot(other)
    return x * other.x + y * other.y
  end
end

def Shuffle(tab)
  e = tab.length - 1
  while e > 0 do
    temp = tab[e]
    index = ((rand)*(e - 1)).round()

    tab[e] = tab[index]
    tab[index] = temp
    e -= 1
  end
end

def MakePermutation()
  p = []
  for i in 0..255
    p.append(i)
  end
  Shuffle(p)
  for i in 0..255
    p.append(p[i])
  end

  return p
end

P = MakePermutation()

def GetConstantVector(v)
  h = v & 3
	if (h == 0)
		return Vector2.new(1.0, 1.0)
  elsif (h == 1)
		return Vector2.new(-1.0, 1.0)
  elsif (h == 2)
		return Vector2.new(-1.0, -1.0)
	else
		return Vector2.new(1.0, -1.0)
  end
end

def Fade(t)
  return ((6*t - 15)*t + 10)*t*t*t;
end

def Lerp(t, a1, a2)
  return a1 + t*(a2-a1);
end

def Noise2D(x, y)
  xx = x.floor() & 255
  yy = y.floor() & 255

  xf = x - x.floor()
  yf = y - y.floor()

  topRight = Vector2.new(xf-1.0, yf-1.0)
	topLeft = Vector2.new(xf, yf-1.0)
	bottomRight = Vector2.new(xf-1.0, yf)
	bottomLeft = Vector2.new(xf, yf)

  valueTopRight = P[P[xx+1]+yy+1]
	valueTopLeft = P[P[xx]+yy+1]
	valueBottomRight = P[P[xx+1]+yy]
	valueBottomLeft = P[P[xx]+yy]

  dotTopRight = topRight.dot(GetConstantVector(valueTopRight))
	dotTopLeft = topLeft.dot(GetConstantVector(valueTopLeft))
	dotBottomRight = bottomRight.dot(GetConstantVector(valueBottomRight))
	dotBottomLeft = bottomLeft.dot(GetConstantVector(valueBottomLeft))

  u = Fade(xf)
	v = Fade(yf)
	
	returnVal = Lerp(u, Lerp(v, dotBottomLeft, dotTopLeft), Lerp(v, dotBottomRight, dotTopRight))

  return (returnVal + 1) / 2
end