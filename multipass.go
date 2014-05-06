package main

import (
	"encoding/binary"
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path"

	"github.com/robbiev/multipass"
)

type LoginResponse struct {
	Success bool
	Items   []multipass.Item
}

func login(password []byte) LoginResponse {
	home := os.Getenv("HOME")
	onePasswordDir := path.Join(home, "/Dropbox/1password/1Password.agilekeychain/data/default")
	keyChain := multipass.NewAgileKeyChain(onePasswordDir)
	defer keyChain.Close()
	err := keyChain.Open(password)
	response := LoginResponse{Success: err == nil}
	if err == nil {
		var items []multipass.Item
		keyChain.ForEachItem(func(p string, f []byte) error {
			item, err := multipass.DecryptFile(f, keyChain.Keys())
			if err == nil {
				items = append(items, item)
			}
			return nil
		})
		response.Items = items
	}
	return response
}

func main() {
	if len(os.Getenv("MULTIPASS_LOGGING")) > 0 {
		f, err := os.OpenFile("/home/robbie/log.txt", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
		if err != nil {
			return
		}
		log.SetOutput(f)
	} else {
		log.SetOutput(ioutil.Discard)
	}

	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in f", r)
		}
	}()

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

		log.Println("read message")
		log.Println(string(message))

		type Command struct {
			Action  string
			Payload interface{}
		}

		var command Command
		json.Unmarshal(message, &command)
		payload := command.Payload.(map[string]interface{})

		password := []byte(payload["Password"].(string))
		response := login(password)

		encoded, _ := json.Marshal(response)

		log.Println(string(encoded))
		log.Println(len(encoded))

		// simply echo the message back
		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(encoded)))

		_, er := os.Stdout.Write(encoded)
		if er != nil {
			log.Println(er)
			break
		}
	}
}
