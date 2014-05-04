package main

import (
	"encoding/binary"
	"os"
)

func main() {
	for {
		// get message length, 4 bytes
		var length uint32
		err := binary.Read(os.Stdin, binary.LittleEndian, &length)
		if err != nil {
			break
		}

		// read message
		message := make([]byte, length)
		_, e := os.Stdin.Read(message)
		if e != nil {
			break
		}

		// simply echo the message back
		binary.Write(os.Stdout, binary.LittleEndian, length)
		_, er := os.Stdout.Write(message)
		if er != nil {
			break
		}
	}
}
