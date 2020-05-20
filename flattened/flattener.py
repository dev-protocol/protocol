import os

PROJECT_PATH = '/Users/hogehoge/frame00/protocol'

def get_target_file_path_list():
	path_list = []
	path = os.path.join(PROJECT_PATH, 'contracts/src')
	for dir_path, sub_dirs, file_names in os.walk(path):
		for file_name in file_names:
			if file_name.endswith('.sol'):
				path_list.append(os.path.join(dir_path, file_name))
	return path_list

def edit_zeppelin_import(line):
	splited = line.split(' ')
	tmp = splited[3][:-3]
	tmp = tmp[1:]
	tmp = '../../../../../../../..' + PROJECT_PATH + '/node_modules/' + tmp
	return 'import "' + tmp + '";\n'

def edit_import(line):
	splited = line.split(' ')
	tmp = splited[3][:-3]
	tmp = tmp[1:]
	tmp = '../../../../../../../..' + PROJECT_PATH + '/' + tmp
	return 'import "' + tmp + '";\n'

def edit_file(file_path):
	print(file_path)
	original_file = open(file_path, "r")
	edit_file = open(file_path + '.tmp', 'w')
	for line in original_file:
		if line.startswith('import '):
			if '@openzeppelin' in line:
				edit_file.write(edit_zeppelin_import(line))
			else:
				edit_file.write(edit_import(line))
		else:
			edit_file.write(line)
	original_file.close()
	edit_file.close()
	os.remove(file_path)
	os.rename(file_path + '.tmp', file_path)

def main():
	file_path_list = get_target_file_path_list()
	for file_path in file_path_list:
		edit_file(file_path)



if __name__ == '__main__':
	main()


