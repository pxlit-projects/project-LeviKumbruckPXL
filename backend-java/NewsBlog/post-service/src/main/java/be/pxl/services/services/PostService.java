package be.pxl.services.services;

import be.pxl.services.api.dto.PostDto;
import be.pxl.services.domain.Post;
import be.pxl.services.repository.PostRepository;
import be.pxl.services.services.converter.PostConverter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService implements IPostService{

    private final PostRepository postRepository;
    private final PostConverter postConverter;


    public PostService(PostRepository postRepository, PostConverter postConverter) {
        this.postRepository = postRepository;
        this.postConverter = postConverter;
    }

    @Override
    public List<PostDto> getAllPosts() {

        List<Post> posts = postRepository.findAll();

        return posts.stream()
                .map(postConverter::convert)
                .collect(Collectors.toList());
    }


    @Override
    public PostDto getPostById(Long id) {
        return null;
    }

    @Override
    public void deletePost(Long id) {

    }

    @Override
    public PostDto updatePost(Long id, PostDto postDto) {
        return null;
    }

    @Override
    public PostDto createPost(PostDto postDto) {
        return null;
    }

}
